import type { WishlistItem } from "../types";

/**
 * What `service/wishlist.service.ts`'s `moveItemToCart` hands back.
 * Deliberately doesn't call into `modules/cart` (never imported here,
 * per this foundation's constraints) — moving an item to a cart is two
 * separate operations owned by two separate modules; this is only the
 * wishlist side (removing the item), returning enough of it
 * (`productId`/`sku`/quantity intent) for a future caller to add it to
 * a cart itself via `modules/cart`'s own service.
 */
export interface MoveToCartResult {
  removedItem: WishlistItem;
}
