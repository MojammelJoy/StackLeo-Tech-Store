import type { WishlistStatus, WishlistVisibility } from "../constants";

/**
 * The persisted Wishlist domain entity. Not a Prisma-generated type —
 * no `Wishlist` model exists in `prisma/schema.prisma` yet (out of
 * scope for this foundation). Exactly one of `userId`/`guestToken` is
 * set at any time — never both, never neither — enforced by a future
 * concrete service implementation, not by this type itself, mirroring
 * `modules/cart`'s `Cart`.
 */
export interface Wishlist {
  id: string;
  userId: string | null;
  guestToken: string | null;
  visibility: WishlistVisibility;
  /** Set only once `visibility` is `"shared"` — see `WISHLIST_VISIBILITIES`'s comment in `constants/wishlist.constants.ts`. */
  shareToken: string | null;
  status: WishlistStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWishlistInput {
  userId?: string | null;
  guestToken?: string | null;
  status?: WishlistStatus;
}

/**
 * Deliberately narrow: `userId`/`guestToken` are identity fields, not
 * something a general-purpose update mutates. `shareToken` is set via
 * `WishlistService.generateShareToken`/`revokeShareToken`, not a direct
 * field write, since generating one is a distinct operation from
 * editing the wishlist itself.
 */
export interface UpdateWishlistInput {
  status?: WishlistStatus;
  visibility?: WishlistVisibility;
  shareToken?: string | null;
}
