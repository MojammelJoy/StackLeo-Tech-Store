import type { WishlistItem } from "../types";

/**
 * Whether an item's current price is lower than the price it was added
 * at — the core signal a future notification feature (see
 * `notification.util.ts`) would use to alert a wishlist owner.
 * `currentPrice` is supplied by the caller (a live product price
 * lookup), never fetched here — this module never imports
 * `modules/product`.
 */
export function hasPriceDropped(item: WishlistItem, currentPrice: number): boolean {
  return currentPrice < item.priceAtAdd;
}

/** Positive when the price dropped, negative when it rose, `0` when unchanged. */
export function getPriceDifference(item: WishlistItem, currentPrice: number): number {
  return item.priceAtAdd - currentPrice;
}
