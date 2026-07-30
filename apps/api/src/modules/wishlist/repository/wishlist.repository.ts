import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { WishlistFilterOptions } from "../interfaces";
import type {
  CreateWishlistInput,
  CreateWishlistItemInput,
  UpdateWishlistInput,
  UpdateWishlistItemInput,
  Wishlist,
  WishlistItem,
} from "../types";

/**
 * Persistence contract for the Wishlist domain entity, plus its items.
 * The service depends on this interface, never on a concrete
 * implementation directly, so swapping `WishlistPrismaRepository` for a
 * test double (or a different persistence layer entirely) never
 * touches service code. Item operations are folded into this same
 * interface rather than a parallel one, mirroring `modules/cart`'s
 * `CartRepository` — a wishlist item has no meaningful existence apart
 * from the wishlist that owns it.
 *
 * `findItemsByWishlistId` takes a `ParsedQuery` and returns a
 * `PaginatedResult` — unlike `modules/cart`'s flat
 * `findItemsByCartId` — since sorting and pagination over items are
 * explicit requirements for this foundation (a wishlist is expected to
 * grow much larger than a cart).
 */
export interface WishlistRepository {
  findById(id: string): Promise<Wishlist | null>;
  findByUserId(userId: string): Promise<Wishlist | null>;
  findByGuestToken(guestToken: string): Promise<Wishlist | null>;
  findByShareToken(shareToken: string): Promise<Wishlist | null>;
  findAll(query: ParsedQuery, filters?: WishlistFilterOptions): Promise<PaginatedResult<Wishlist>>;
  create(data: CreateWishlistInput): Promise<Wishlist>;
  update(id: string, data: UpdateWishlistInput): Promise<Wishlist>;
  delete(id: string): Promise<void>;

  findItemsByWishlistId(
    wishlistId: string,
    query: ParsedQuery,
  ): Promise<PaginatedResult<WishlistItem>>;
  findItemById(itemId: string): Promise<WishlistItem | null>;
  findItemByProductId(wishlistId: string, productId: string): Promise<WishlistItem | null>;
  addItem(data: CreateWishlistItemInput): Promise<WishlistItem>;
  updateItem(itemId: string, data: UpdateWishlistItemInput): Promise<WishlistItem>;
  removeItem(itemId: string): Promise<void>;
}
