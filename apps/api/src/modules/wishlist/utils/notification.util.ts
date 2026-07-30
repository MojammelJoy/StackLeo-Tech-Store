import type { WishlistItem } from "../types";

/**
 * Items whose owner opted into availability notifications — the
 * candidate set a future notification module would scan (for a price
 * drop, restock, etc.) via `utils/price-comparison.util.ts`'s
 * `hasPriceDropped`. Nothing in this foundation sends a notification;
 * this only narrows down which items would matter to one.
 */
export function filterItemsNeedingNotification(items: WishlistItem[]): WishlistItem[] {
  return items.filter((item) => item.notifyOnAvailability);
}
