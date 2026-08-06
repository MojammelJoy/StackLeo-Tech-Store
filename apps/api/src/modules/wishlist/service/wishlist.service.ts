import { BadRequestError, ConflictError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";
import { wishlistMapper } from "../mapper";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type {
  AddWishlistItemDto,
  MoveToCartResponseDto,
  UpdateWishlistItemDto,
  WishlistItemResponseDto,
  WishlistResponseDto,
} from "../dto";
import type { CartItemAdder } from "../interfaces";
import type { ProductLookupRepository, ProductSnapshot, WishlistRepository } from "../repository";
import type { Wishlist, WishlistItem } from "../types";

/** A product must be `active`/`public` (and not soft-deleted) to be
 * addable to a wishlist — mirrors `modules/cart`'s own sellability
 * check (see `CartService`'s `SELLABLE_PRODUCT_STATUS`), duplicated as
 * bare strings for the same decoupling reason `modules/search`
 * documents on `SEARCH_VISIBLE_STATUS` (this module never imports
 * `modules/product`). Unlike a cart, current stock is deliberately not
 * checked here — a wishlist is explicitly a place to track products
 * that might be unavailable *right now* (that's what
 * `notifyOnAvailability` is for).
 */
const WISHLISTABLE_PRODUCT_STATUS = "active";
const WISHLISTABLE_PRODUCT_VISIBILITY = "public";

/**
 * Implements every Wishlist API operation: current-user wishlist
 * lookup (get-or-create), item add/update/remove, existence check,
 * move-to-cart, and paginated/sorted/filtered/searched item listing.
 * Depends on `WishlistRepository` (wishlist/item persistence),
 * `ProductLookupRepository` (read-only product facts — see that
 * interface's doc comment for why this exists instead of importing
 * `modules/product` directly), and `CartItemAdder` (the one integration
 * point with `modules/cart`'s real `CartService` that `moveItemToCart`
 * uses — see that interface's doc comment) — interfaces only, never
 * Prisma directly.
 *
 * Every method requires a real `actor: AuthenticatedUser` — unlike
 * `modules/cart`'s guest-aware `CartService`, this module is
 * authenticated-users-only end to end (no route ever calls it without
 * one; see `routes/wishlist.routes.ts`). Ownership of a wishlist/item
 * is still enforced here regardless (`getOwnedWishlist`), never trusted
 * from a request's `wishlistId`/`itemId` alone, for the same reason
 * `modules/cart`'s `CartService` does — a hidden/foreign wishlist is
 * reported as `NotFoundError`, never `ForbiddenError`, so a request
 * never confirms another user's wishlist even exists.
 */
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productLookup: ProductLookupRepository,
    private readonly cartItemAdder: CartItemAdder,
  ) {}

  async getWishlistForUser(actor: AuthenticatedUser): Promise<WishlistResponseDto> {
    const wishlist = await this.wishlistRepository.findOrCreateActiveByUserId(actor.id);
    return this.buildWishlistResponse(wishlist);
  }

  async findItems(
    actor: AuthenticatedUser,
    query: ParsedQuery,
  ): Promise<PaginatedResult<WishlistItemResponseDto>> {
    const wishlist = await this.wishlistRepository.findOrCreateActiveByUserId(actor.id);
    const result = await this.wishlistRepository.findItemsByWishlistId(wishlist.id, query);
    return { items: wishlistMapper.toItemResponseList(result.items), meta: result.meta };
  }

  /** Never auto-creates a wishlist — a user with no wishlist yet
   * trivially has never wishlisted anything, so the answer is `false`
   * without needing a row to exist first. */
  async hasProduct(actor: AuthenticatedUser, productId: string): Promise<boolean> {
    const wishlist = await this.wishlistRepository.findByUserId(actor.id);
    if (!wishlist) {
      return false;
    }
    const item = await this.wishlistRepository.findItemByProductId(wishlist.id, productId);
    return item !== null;
  }

  async addItem(actor: AuthenticatedUser, dto: AddWishlistItemDto): Promise<WishlistResponseDto> {
    const wishlist = await this.wishlistRepository.findOrCreateActiveByUserId(actor.id);

    const existing = await this.wishlistRepository.findItemByProductId(wishlist.id, dto.productId);
    if (existing) {
      throw new ConflictError("Product already exists in this wishlist");
    }

    const snapshot = await this.assertWishlistable(dto.productId, dto.sku);

    await this.wishlistRepository.addItem({
      wishlistId: wishlist.id,
      productId: dto.productId,
      sku: snapshot.sku,
      priceAtAdd: snapshot.price,
      notifyOnAvailability: dto.notifyOnAvailability,
    });

    logger.info(
      { wishlistId: wishlist.id, productId: dto.productId, actorId: actor.id },
      "Wishlist item added",
    );
    return this.buildWishlistResponse(wishlist);
  }

  async updateItem(
    actor: AuthenticatedUser,
    itemId: string,
    dto: UpdateWishlistItemDto,
  ): Promise<WishlistResponseDto> {
    const item = await this.getExistingItem(itemId);
    const wishlist = await this.getOwnedWishlist(item.wishlistId, actor);

    await this.wishlistRepository.updateItem(itemId, dto);
    logger.info(
      {
        wishlistId: wishlist.id,
        itemId,
        actorId: actor.id,
        notifyOnAvailability: dto.notifyOnAvailability,
      },
      "Wishlist item updated",
    );
    return this.buildWishlistResponse(wishlist);
  }

  async removeItem(actor: AuthenticatedUser, itemId: string): Promise<WishlistResponseDto> {
    const item = await this.getExistingItem(itemId);
    const wishlist = await this.getOwnedWishlist(item.wishlistId, actor);

    await this.wishlistRepository.removeItem(itemId);
    logger.info({ wishlistId: wishlist.id, itemId, actorId: actor.id }, "Wishlist item removed");
    return this.buildWishlistResponse(wishlist);
  }

  /**
   * Adds the item's product to `actor`'s cart via `CartItemAdder`
   * (`modules/cart`'s real `CartService`, wired in by
   * `routes/wishlist.routes.ts` — see `interfaces/cart-item-adder.interface.ts`),
   * then removes it from the wishlist. The two steps are deliberately
   * NOT wrapped in one atomic transaction — they span two
   * independently-owned modules/tables (no shared Prisma transaction
   * client crosses that boundary), and if the wishlist-removal step
   * were to fail *after* the cart addition already succeeded, leaving
   * the item in both places is the safer outcome for a "move" than
   * silently discarding a cart addition the caller has every reason to
   * believe already happened.
   */
  async moveItemToCart(actor: AuthenticatedUser, itemId: string): Promise<MoveToCartResponseDto> {
    const item = await this.getExistingItem(itemId);
    const wishlist = await this.getOwnedWishlist(item.wishlistId, actor);

    const cart = await this.cartItemAdder.addItemToCart(actor, item.productId, item.sku);
    await this.wishlistRepository.removeItem(itemId);

    logger.info(
      { wishlistId: wishlist.id, itemId, productId: item.productId, actorId: actor.id },
      "Wishlist item moved to cart",
    );
    return { wishlist: await this.buildWishlistResponse(wishlist), cart };
  }

  private async getOwnedWishlist(wishlistId: string, actor: AuthenticatedUser): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findById(wishlistId);
    if (!wishlist || wishlist.userId !== actor.id) {
      throw new NotFoundError("Wishlist not found");
    }
    return wishlist;
  }

  private async getExistingItem(itemId: string): Promise<WishlistItem> {
    const item = await this.wishlistRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundError("Wishlist item not found");
    }
    return item;
  }

  private async assertWishlistable(
    productId: string,
    requestedSku: string,
  ): Promise<ProductSnapshot> {
    const snapshot = await this.productLookup.findById(productId);
    if (!this.isWishlistable(snapshot)) {
      throw new NotFoundError("Product not found or unavailable");
    }
    if (snapshot.sku !== requestedSku) {
      throw new BadRequestError('"sku" does not match the given product');
    }
    return snapshot;
  }

  private isWishlistable(snapshot: ProductSnapshot | null): snapshot is ProductSnapshot {
    return (
      !!snapshot &&
      snapshot.deletedAt === null &&
      snapshot.status === WISHLISTABLE_PRODUCT_STATUS &&
      snapshot.visibility === WISHLISTABLE_PRODUCT_VISIBILITY
    );
  }

  private async buildWishlistResponse(wishlist: Wishlist): Promise<WishlistResponseDto> {
    const items = await this.wishlistRepository.findAllItemsByWishlistId(wishlist.id);
    return wishlistMapper.toWishlistResponseDto(wishlist, items);
  }
}
