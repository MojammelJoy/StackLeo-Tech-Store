import { randomUUID } from "node:crypto";

import { BadRequestError, ConflictError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";
import { CART_ITEM_MAX_QUANTITY, CART_STATUSES } from "../constants";
import { cartMapper } from "../mapper";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { AddCartItemDto, CartResponseDto, CreateCartDto, UpdateCartItemDto } from "../dto";
import type { CartFilterOptions } from "../interfaces";
import type {
  CartRepository,
  ProductAvailabilityRepository,
  ProductAvailabilitySnapshot,
  ProductVariantAvailabilitySnapshot,
} from "../repository";
import type { Cart, CartItem, MergeCartItemInput } from "../types";

/** A product must be `active`/`public` (and not soft-deleted) to be
 * addable to a cart — mirrors `modules/product`'s own
 * `ProductService.isVisibleTo` check, duplicated as bare strings for
 * the same decoupling reason `modules/search` documents on
 * `SEARCH_VISIBLE_STATUS` (this module never imports `modules/product`). */
const SELLABLE_PRODUCT_STATUS = "active";
const SELLABLE_PRODUCT_VISIBILITY = "public";

/** What a `(productId, sku)` pair resolved to — the line's real sku
 * (unchanged for a base product, the variant's own for a variant) and
 * its effective price/currency. */
interface ResolvedCartLine {
  sku: string;
  price: number;
  currency: string;
}

/**
 * Implements every Cart API operation: guest/authenticated cart
 * lookup and creation, item add/update/remove/clear (base-product or
 * active-variant SKU), guest-cart merge after login, current-price-aware
 * totals, and admin listing (pagination/filtering). Depends on
 * `CartRepository` (cart/item persistence) and `ProductAvailabilityRepository`
 * (read-only product/variant/inventory facts — see that interface's doc
 * comment for why this exists instead of importing `modules/product`/
 * `modules/inventory` directly) — interfaces only, never Prisma directly.
 *
 * Every mutating method takes `actor: AuthenticatedUser | null` and
 * enforces ownership itself (`assertCanMutateCart`) rather than
 * trusting the `cartId`/`itemId` in the request: an authenticated
 * actor's cart must have `userId === actor.id`; a guest (`actor ===
 * null`) may only touch a cart with `userId === null` — the cart's own
 * (unguessable `cuid`) id is that guest's only proof of ownership,
 * there being no stronger identity available. This is the one
 * responsibility every route handler in `controller/cart.controller.ts`
 * delegates to this service rather than checking itself.
 */
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productAvailability: ProductAvailabilityRepository,
  ) {}

  async getCartForUser(actor: AuthenticatedUser): Promise<CartResponseDto> {
    const cart = await this.getOrCreateActiveCartForUser(actor);
    return this.buildCartResponse(cart);
  }

  async getCartForGuestToken(guestToken: string): Promise<CartResponseDto> {
    const cart = await this.getActiveCartByGuestToken(guestToken);
    return this.buildCartResponse(cart);
  }

  /** Get-or-create, public: `controller/cart.controller.ts` resolves
   * "which cart" this way before every item mutation for an
   * authenticated caller, not just for the `GET /cart` read path. */
  async getOrCreateActiveCartForUser(actor: AuthenticatedUser): Promise<Cart> {
    const existing = await this.cartRepository.findByUserId(actor.id);
    if (existing) {
      return existing;
    }
    const created = await this.cartRepository.create({
      userId: actor.id,
      status: CART_STATUSES.ACTIVE,
    });
    logger.info({ cartId: created.id, actorId: actor.id }, "Authenticated cart created");
    return created;
  }

  /** Find-only (never creates), public: `controller/cart.controller.ts`
   * resolves "which cart" this way before every item mutation for a
   * guest caller — a guest must already hold a token from
   * `createGuestCart` (`POST /cart/guest`); this method never mints one
   * itself. */
  async getActiveCartByGuestToken(guestToken: string): Promise<Cart> {
    const cart = await this.cartRepository.findByGuestToken(guestToken);
    if (!cart) {
      throw new NotFoundError("Guest cart not found");
    }
    return cart;
  }

  /** Always creates a brand-new guest cart — never "find or create" —
   * since a guest has no existing identity to look up by until this
   * call hands them a token. Generates `guestToken` itself
   * (`randomUUID`) when the caller didn't supply one. */
  async createGuestCart(dto: CreateCartDto): Promise<CartResponseDto> {
    const cart = await this.cartRepository.create({
      guestToken: dto.guestToken ?? randomUUID(),
      currency: dto.currency,
      status: CART_STATUSES.ACTIVE,
    });
    logger.info({ cartId: cart.id }, "Guest cart created");
    return this.buildCartResponse(cart);
  }

  /**
   * `dto.sku` may be either the product's own sku or one of its active
   * variants' skus — resolved by `resolveSellableLine`, which also
   * decides the effective price (see that method's doc comment).
   * `findItemByCartAndSku` (not `findByCartAndProduct` — a cart's real
   * line identity is `sku`, see `prisma/schema.prisma`'s `CartItem` doc
   * comment) means two different variants of the same product become
   * two separate lines, never merged.
   */
  async addItem(
    cartId: string,
    dto: AddCartItemDto,
    actor: AuthenticatedUser | null,
  ): Promise<CartResponseDto> {
    const cart = await this.getOwnedCart(cartId, actor);
    const existing = await this.cartRepository.findItemByCartAndSku(cartId, dto.sku);
    const existingQuantity = existing?.quantity ?? 0;
    const finalQuantity = existingQuantity + dto.quantity;

    if (finalQuantity > CART_ITEM_MAX_QUANTITY) {
      throw new BadRequestError(
        `Cannot add ${dto.quantity} more of this item — cart already has ${existingQuantity}, and a single line item cannot exceed ${CART_ITEM_MAX_QUANTITY}`,
      );
    }

    const resolved = await this.resolveSellableLine(dto.productId, dto.sku, cart.currency);
    await this.assertStockAvailable(resolved.sku, finalQuantity);

    await this.cartRepository.addItem({
      cartId,
      productId: dto.productId,
      sku: resolved.sku,
      quantity: finalQuantity,
      unitPrice: resolved.price,
    });

    logger.info(
      { cartId, productId: dto.productId, sku: resolved.sku, quantity: finalQuantity },
      existing ? "Cart item quantity updated" : "Cart item added",
    );
    return this.buildCartResponse(cart);
  }

  async updateItem(
    itemId: string,
    dto: UpdateCartItemDto,
    actor: AuthenticatedUser | null,
  ): Promise<CartResponseDto> {
    const item = await this.getExistingItem(itemId);
    const cart = await this.getOwnedCart(item.cartId, actor);

    if (dto.quantity !== undefined) {
      // `item.sku` is already whatever this line's real sku is (base
      // product or variant) — stock is always checked against that
      // exact sku, no resolution needed here.
      await this.assertStockAvailable(item.sku, dto.quantity);
    }

    await this.cartRepository.updateItem(itemId, {
      quantity: dto.quantity,
      selected: dto.selected,
    });
    logger.info({ cartId: cart.id, itemId, ...dto }, "Cart item updated");
    return this.buildCartResponse(cart);
  }

  async removeItem(itemId: string, actor: AuthenticatedUser | null): Promise<CartResponseDto> {
    const item = await this.getExistingItem(itemId);
    const cart = await this.getOwnedCart(item.cartId, actor);

    await this.cartRepository.removeItem(itemId);
    logger.info({ cartId: cart.id, itemId }, "Cart item removed");
    return this.buildCartResponse(cart);
  }

  async clearCart(cartId: string, actor: AuthenticatedUser | null): Promise<CartResponseDto> {
    const cart = await this.getOwnedCart(cartId, actor);
    await this.cartRepository.clearItems(cartId);
    logger.info({ cartId }, "Cart cleared");
    return this.buildCartResponse(cart);
  }

  /** Marks `cartId` `CART_STATUSES.CONVERTED` — what a cart becomes
   * once `modules/order` turns it into a placed order (see
   * `CART_STATUSES`'s doc comment, which anticipated exactly this).
   * Ownership-checked the same as every other mutation here; deliberately
   * doesn't clear the cart's items — a converted cart's contents remain
   * as a historical record of what was ordered from it, and
   * `findByUserId`/`findByGuestToken` only ever resolve the *active*
   * cart, so a converted cart is never resurfaced as "the" cart again. */
  async convertCart(cartId: string, actor: AuthenticatedUser | null): Promise<void> {
    await this.getOwnedCart(cartId, actor);
    await this.cartRepository.update(cartId, { status: CART_STATUSES.CONVERTED });
    logger.info({ cartId }, "Cart converted");
  }

  /**
   * Folds `guestCartId`'s items into `actor`'s active cart (creating
   * one first if they don't have one yet), then marks the guest cart
   * `MERGED`. Unlike `addItem`, an individual item that's gone stale
   * since the guest added it (product/variant deleted/unpublished/
   * deactivated, currency mismatch, no stock left) is *dropped from the
   * merge* rather than failing the whole operation — there's no
   * interactive caller to surface a per-item error to during a
   * post-login reconciliation step; a partially-clamped/skipped merge
   * is the useful outcome, a failed login-time merge is not. Every
   * resolved item is written atomically via `CartRepository.mergeItemsIntoCart`.
   */
  async mergeGuestCartIntoUserCart(
    guestCartId: string,
    actor: AuthenticatedUser,
  ): Promise<CartResponseDto> {
    const guestCart = await this.cartRepository.findById(guestCartId);
    if (!guestCart) {
      throw new NotFoundError("Guest cart not found");
    }
    if (guestCart.userId !== null || guestCart.status !== CART_STATUSES.ACTIVE) {
      throw new ConflictError("Cart is not an active guest cart and cannot be merged");
    }

    const targetCart = await this.getOrCreateActiveCartForUser(actor);
    const [guestItems, targetItems] = await Promise.all([
      this.cartRepository.findItemsByCartId(guestCartId),
      this.cartRepository.findItemsByCartId(targetCart.id),
    ]);

    const resolvedItems = await this.resolveMergeItems(
      guestItems,
      targetItems,
      targetCart.currency,
    );

    const merged = await this.cartRepository.mergeItemsIntoCart({
      guestCartId,
      targetCartId: targetCart.id,
      items: resolvedItems,
    });

    logger.info(
      {
        guestCartId,
        targetCartId: targetCart.id,
        actorId: actor.id,
        mergedItemCount: resolvedItems.length,
      },
      "Guest cart merged into user cart",
    );
    return this.buildCartResponse(merged);
  }

  async listCarts(
    query: ParsedQuery,
    filters: CartFilterOptions,
  ): Promise<PaginatedResult<CartResponseDto>> {
    const result = await this.cartRepository.findAll(query, filters);
    if (result.items.length === 0) {
      return { items: [], meta: result.meta };
    }

    const allItems = await this.cartRepository.findItemsByCartIds(
      result.items.map((cart) => cart.id),
    );
    // One batched live-pricing pass across every cart on the page,
    // rather than one per cart — same "batch the whole page" shape
    // `modules/product`'s bulk lookup already established.
    const pricedItems = await this.applyLivePricingToMany(allItems);

    const itemsByCartId = new Map<string, CartItem[]>();
    for (const item of pricedItems) {
      const items = itemsByCartId.get(item.cartId) ?? [];
      items.push(item);
      itemsByCartId.set(item.cartId, items);
    }

    const items = result.items.map((cart) =>
      cartMapper.toCartResponseDto(cart, itemsByCartId.get(cart.id) ?? []),
    );
    return { items, meta: result.meta };
  }

  /**
   * Resolves each guest item's final merged state — sku-aware: two
   * guest lines for the same product but different (variant) skus merge
   * into two separate target lines, never collapsed into one (a cart
   * line's real identity is `sku`, not `productId` — see
   * `prisma/schema.prisma`'s `CartItem` doc comment).
   */
  private async resolveMergeItems(
    guestItems: CartItem[],
    targetItems: CartItem[],
    targetCurrency: string,
  ): Promise<MergeCartItemInput[]> {
    if (guestItems.length === 0) {
      return [];
    }

    const productIds = [...new Set(guestItems.map((item) => item.productId))];
    const productSnapshots = await this.productAvailability.findManyByIds(productIds);
    const variantSnapshots = await this.productAvailability.findManyVariantsBySkus(
      this.selectVariantSkus(guestItems, productSnapshots),
    );
    const targetQuantityBySku = new Map(targetItems.map((item) => [item.sku, item.quantity]));

    const resolved: MergeCartItemInput[] = [];
    for (const item of guestItems) {
      const line = this.resolveMergeLine(
        item,
        productSnapshots.get(item.productId),
        variantSnapshots,
        targetCurrency,
      );
      if (!line) {
        continue;
      }

      const requestedQuantity = (targetQuantityBySku.get(line.sku) ?? 0) + item.quantity;
      const boundedQuantity = Math.min(requestedQuantity, CART_ITEM_MAX_QUANTITY);
      const available = await this.productAvailability.getAvailableQuantity(line.sku);
      const finalQuantity = Math.min(boundedQuantity, available);

      if (finalQuantity <= 0) {
        logger.warn(
          { productId: item.productId, sku: line.sku },
          "Skipped out-of-stock guest cart item during merge",
        );
        continue;
      }

      resolved.push({
        productId: item.productId,
        sku: line.sku,
        quantity: finalQuantity,
        unitPrice: line.price,
      });
    }
    return resolved;
  }

  /** One guest item's resolved `(sku, price)`, or `null` if it should
   * be dropped from the merge (product/variant no longer sellable, or a
   * currency mismatch against the target cart). Logs exactly why on
   * every skip — the caller has no other way to see it, since a
   * skipped item never surfaces as an error to the end user. */
  private resolveMergeLine(
    item: CartItem,
    product: ProductAvailabilitySnapshot | undefined,
    variantSnapshots: Map<string, ProductVariantAvailabilitySnapshot>,
    targetCurrency: string,
  ): { sku: string; price: number } | null {
    if (!this.isSellable(product)) {
      logger.warn(
        { productId: item.productId },
        "Skipped stale guest cart item during merge (product unavailable)",
      );
      return null;
    }

    if (item.sku === product.sku) {
      if (product.currency !== targetCurrency) {
        logger.warn(
          { productId: item.productId, sku: item.sku },
          "Skipped guest cart item during merge (currency mismatch)",
        );
        return null;
      }
      return { sku: product.sku, price: product.price };
    }

    const variant = variantSnapshots.get(item.sku);
    if (!variant || variant.productId !== item.productId || !variant.isActive) {
      logger.warn(
        { productId: item.productId, sku: item.sku },
        "Skipped stale guest cart item during merge (variant unavailable)",
      );
      return null;
    }

    const price = variant.price ?? product.price;
    const currency = variant.currency ?? product.currency;
    if (currency !== targetCurrency) {
      logger.warn(
        { productId: item.productId, sku: item.sku },
        "Skipped guest cart item during merge (currency mismatch)",
      );
      return null;
    }
    return { sku: variant.sku, price };
  }

  private async getOwnedCart(cartId: string, actor: AuthenticatedUser | null): Promise<Cart> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new NotFoundError("Cart not found");
    }
    this.assertCanMutateCart(cart, actor);
    return cart;
  }

  private async getExistingItem(itemId: string): Promise<CartItem> {
    const item = await this.cartRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundError("Cart item not found");
    }
    return item;
  }

  /** An authenticated actor may only mutate their own cart
   * (`cart.userId === actor.id`); a guest (`actor === null`) may only
   * mutate a cart with no owning user at all. Either mismatch is
   * reported as `NotFoundError`, not `ForbiddenError` — the same
   * "hidden is indistinguishable from nonexistent" treatment
   * `modules/product`/`modules/category`/`modules/brand` give a
   * visibility-scoped row, so a request never confirms *another*
   * identity's cart even exists. */
  private assertCanMutateCart(cart: Cart, actor: AuthenticatedUser | null): void {
    const owned = actor ? cart.userId === actor.id : cart.userId === null;
    if (!owned) {
      throw new NotFoundError("Cart not found");
    }
  }

  /**
   * Resolves what `(productId, requestedSku)` actually refers to and
   * whether it's currently sellable — either the product's own sku (the
   * original, base-product-only path, fully unchanged: same checks,
   * same order, same error messages) or one of its *active* variants'
   * skus. The parent product's own sellability (`active`/`public`/not
   * deleted) is always checked first and always required, regardless of
   * which path resolves — a variant of an unpublished/deleted product
   * is never addable even if the variant itself is active.
   *
   * A `requestedSku` that is neither the product's own sku nor a real,
   * active variant of *this* product falls through to the same
   * `BadRequestError` the base-product-only version of this method
   * always threw for a mismatched sku — deliberately not distinguishing
   * "no such variant exists" from "that variant belongs to a different
   * product" from "that's just a wrong sku", for the same "don't leak
   * what exists" reasoning `assertCanMutateCart` documents.
   */
  private async resolveSellableLine(
    productId: string,
    requestedSku: string,
    cartCurrency: string,
  ): Promise<ResolvedCartLine> {
    const product = await this.productAvailability.findById(productId);
    if (!this.isSellable(product)) {
      throw new NotFoundError("Product not found or unavailable");
    }

    if (requestedSku === product.sku) {
      this.assertCurrencyMatches(product.currency, cartCurrency);
      return { sku: product.sku, price: product.price, currency: product.currency };
    }

    const variant = await this.productAvailability.findVariantBySku(requestedSku);
    if (!variant || variant.productId !== productId) {
      throw new BadRequestError('"sku" does not match the given product');
    }
    if (!variant.isActive) {
      throw new NotFoundError("Product variant not found or unavailable");
    }

    const price = variant.price ?? product.price;
    const currency = variant.currency ?? product.currency;
    this.assertCurrencyMatches(currency, cartCurrency);

    return { sku: variant.sku, price, currency };
  }

  private isSellable(
    snapshot: ProductAvailabilitySnapshot | null | undefined,
  ): snapshot is ProductAvailabilitySnapshot {
    return (
      !!snapshot &&
      snapshot.deletedAt === null &&
      snapshot.status === SELLABLE_PRODUCT_STATUS &&
      snapshot.visibility === SELLABLE_PRODUCT_VISIBILITY
    );
  }

  private assertCurrencyMatches(skuCurrency: string, cartCurrency: string): void {
    if (skuCurrency !== cartCurrency) {
      throw new ConflictError(
        `Product currency "${skuCurrency}" does not match cart currency "${cartCurrency}"`,
      );
    }
  }

  private async assertStockAvailable(sku: string, requiredQuantity: number): Promise<void> {
    const available = await this.productAvailability.getAvailableQuantity(sku);
    if (available < requiredQuantity) {
      throw new ConflictError(
        `Only ${available} unit(s) of "${sku}" are available, but ${requiredQuantity} were requested`,
      );
    }
  }

  private async buildCartResponse(cart: Cart): Promise<CartResponseDto> {
    const items = await this.cartRepository.findItemsByCartId(cart.id);
    const pricedItems = await this.applyLivePricingToMany(items);
    return cartMapper.toCartResponseDto(cart, pricedItems);
  }

  /** Every distinct `sku` among `items` that isn't its own product's
   * base sku — i.e. every variant line — batched into one
   * `findManyVariantsBySkus` call by `applyLivePricingToMany`/
   * `resolveMergeItems`, never one lookup per item. */
  private selectVariantSkus(
    items: CartItem[],
    productSnapshots: Map<string, ProductAvailabilitySnapshot>,
  ): string[] {
    return [
      ...new Set(
        items
          .filter((item) => productSnapshots.get(item.productId)?.sku !== item.sku)
          .map((item) => item.sku),
      ),
    ];
  }

  /**
   * Re-prices every item at its *current* rate — never mutates the
   * persisted snapshot (see `prisma/schema.prisma`'s `CartItem` doc
   * comment). Base-product lines use the product's current price;
   * variant lines use the variant's current price, falling back to the
   * product's current price if the variant doesn't override it — the
   * same fallback `resolveSellableLine` applies at add-time. A product
   * (or variant) no longer found (deleted since being added) falls back
   * to the item's last-known stored price rather than failing the whole
   * response. One batched query for every distinct product id and one
   * for every distinct variant sku involved — regardless of how many
   * items (or, from `listCarts`, how many carts) are being priced.
   */
  private async applyLivePricingToMany(items: CartItem[]): Promise<CartItem[]> {
    if (items.length === 0) {
      return items;
    }

    const productIds = [...new Set(items.map((item) => item.productId))];
    const productSnapshots = await this.productAvailability.findManyByIds(productIds);
    const variantSnapshots = await this.productAvailability.findManyVariantsBySkus(
      this.selectVariantSkus(items, productSnapshots),
    );

    return items.map((item) => {
      const product = productSnapshots.get(item.productId);
      if (!product) {
        return item;
      }
      if (item.sku === product.sku) {
        return { ...item, unitPrice: product.price };
      }
      const variant = variantSnapshots.get(item.sku);
      if (!variant) {
        return item;
      }
      return { ...item, unitPrice: variant.price ?? product.price };
    });
  }
}
