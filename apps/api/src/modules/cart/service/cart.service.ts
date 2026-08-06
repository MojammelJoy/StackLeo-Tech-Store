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
} from "../repository";
import type { Cart, CartItem, MergeCartItemInput } from "../types";

/** A product must be `active`/`public` (and not soft-deleted) to be
 * addable to a cart — mirrors `modules/product`'s own
 * `ProductService.isVisibleTo` check, duplicated as bare strings for
 * the same decoupling reason `modules/search` documents on
 * `SEARCH_VISIBLE_STATUS` (this module never imports `modules/product`). */
const SELLABLE_PRODUCT_STATUS = "active";
const SELLABLE_PRODUCT_VISIBILITY = "public";

/**
 * Implements every Cart API operation: guest/authenticated cart
 * lookup and creation, item add/update/remove/clear, guest-cart merge
 * after login, current-price-aware totals, and admin listing
 * (pagination/filtering). Depends on `CartRepository` (cart/item
 * persistence) and `ProductAvailabilityRepository` (read-only product/
 * inventory facts — see that interface's doc comment for why this
 * exists instead of importing `modules/product`/`modules/inventory`
 * directly) — interfaces only, never Prisma directly.
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

  async addItem(
    cartId: string,
    dto: AddCartItemDto,
    actor: AuthenticatedUser | null,
  ): Promise<CartResponseDto> {
    const cart = await this.getOwnedCart(cartId, actor);
    const existing = await this.cartRepository.findItemByCartAndProduct(cartId, dto.productId);
    const existingQuantity = existing?.quantity ?? 0;
    const finalQuantity = existingQuantity + dto.quantity;

    if (finalQuantity > CART_ITEM_MAX_QUANTITY) {
      throw new BadRequestError(
        `Cannot add ${dto.quantity} more of this item — cart already has ${existingQuantity}, and a single line item cannot exceed ${CART_ITEM_MAX_QUANTITY}`,
      );
    }

    const snapshot = await this.assertSellable(dto.productId, dto.sku, cart.currency);
    await this.assertStockAvailable(snapshot.sku, finalQuantity);

    await this.cartRepository.addItem({
      cartId,
      productId: dto.productId,
      sku: snapshot.sku,
      quantity: finalQuantity,
      unitPrice: snapshot.price,
    });

    logger.info(
      { cartId, productId: dto.productId, quantity: finalQuantity },
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

  /**
   * Folds `guestCartId`'s items into `actor`'s active cart (creating
   * one first if they don't have one yet), then marks the guest cart
   * `MERGED`. Unlike `addItem`, an individual item that's gone stale
   * since the guest added it (product deleted/unpublished, currency
   * mismatch, no stock left) is *dropped from the merge* rather than
   * failing the whole operation — there's no interactive caller to
   * surface a per-item error to during a post-login reconciliation
   * step; a partially-clamped/skipped merge is the useful outcome, a
   * failed login-time merge is not. Every resolved item is written
   * atomically via `CartRepository.mergeItemsIntoCart`.
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

    const targetQuantityByProduct = new Map(
      targetItems.map((item) => [item.productId, item.quantity]),
    );
    const resolvedItems = await this.resolveMergeItems(
      guestItems,
      targetQuantityByProduct,
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
    const itemsByCartId = new Map<string, CartItem[]>();
    for (const item of allItems) {
      const items = itemsByCartId.get(item.cartId) ?? [];
      items.push(item);
      itemsByCartId.set(item.cartId, items);
    }

    const priceSnapshots = await this.buildPriceSnapshotMap(allItems);
    const items = result.items.map((cart) =>
      cartMapper.toCartResponseDto(
        cart,
        this.applyLivePricing(itemsByCartId.get(cart.id) ?? [], priceSnapshots),
      ),
    );
    return { items, meta: result.meta };
  }

  private async resolveMergeItems(
    guestItems: CartItem[],
    targetQuantityByProduct: Map<string, number>,
    targetCurrency: string,
  ): Promise<MergeCartItemInput[]> {
    const snapshots = await this.productAvailability.findManyByIds(
      guestItems.map((item) => item.productId),
    );

    const resolved: MergeCartItemInput[] = [];
    for (const item of guestItems) {
      const snapshot = snapshots.get(item.productId);
      if (
        !this.isSellable(snapshot) ||
        snapshot.sku !== item.sku ||
        snapshot.currency !== targetCurrency
      ) {
        logger.warn(
          { productId: item.productId },
          "Skipped stale guest cart item during merge (product unavailable or currency mismatch)",
        );
        continue;
      }

      const requestedQuantity = (targetQuantityByProduct.get(item.productId) ?? 0) + item.quantity;
      const boundedQuantity = Math.min(requestedQuantity, CART_ITEM_MAX_QUANTITY);
      const available = await this.productAvailability.getAvailableQuantity(snapshot.sku);
      const finalQuantity = Math.min(boundedQuantity, available);

      if (finalQuantity <= 0) {
        logger.warn(
          { productId: item.productId },
          "Skipped out-of-stock guest cart item during merge",
        );
        continue;
      }

      resolved.push({
        productId: item.productId,
        sku: snapshot.sku,
        quantity: finalQuantity,
        unitPrice: snapshot.price,
      });
    }
    return resolved;
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

  private async assertSellable(
    productId: string,
    requestedSku: string,
    cartCurrency: string,
  ): Promise<ProductAvailabilitySnapshot> {
    const snapshot = await this.productAvailability.findById(productId);
    if (!this.isSellable(snapshot)) {
      throw new NotFoundError("Product not found or unavailable");
    }
    if (snapshot.sku !== requestedSku) {
      throw new BadRequestError('"sku" does not match the given product');
    }
    if (snapshot.currency !== cartCurrency) {
      throw new ConflictError(
        `Product currency "${snapshot.currency}" does not match cart currency "${cartCurrency}"`,
      );
    }
    return snapshot;
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
    const snapshots = await this.buildPriceSnapshotMap(items);
    return cartMapper.toCartResponseDto(cart, this.applyLivePricing(items, snapshots));
  }

  /** Batches one product lookup across every distinct `productId`
   * among `items`, rather than one lookup per item — used both for a
   * single cart's response and (with the union of every item across a
   * whole page) `listCarts`'s admin response. */
  private async buildPriceSnapshotMap(
    items: CartItem[],
  ): Promise<Map<string, ProductAvailabilitySnapshot>> {
    const productIds = [...new Set(items.map((item) => item.productId))];
    return this.productAvailability.findManyByIds(productIds);
  }

  /** Returns `items` with `unitPrice` replaced by each product's
   * *current* price — never mutates the persisted snapshot (see
   * `prisma/schema.prisma`'s `CartItem` doc comment) — satisfying
   * "calculate totals from current product prices" without touching
   * stored data. A product no longer found (deleted since being added)
   * falls back to the item's last-known stored price rather than
   * failing the whole response. */
  private applyLivePricing(
    items: CartItem[],
    snapshots: Map<string, ProductAvailabilitySnapshot>,
  ): CartItem[] {
    return items.map((item) => {
      const snapshot = snapshots.get(item.productId);
      return snapshot ? { ...item, unitPrice: snapshot.price } : item;
    });
  }
}
