import type { WishlistItem } from "../types";

/** Whether a product is already on this wishlist — for a future concrete implementation to check before adding a duplicate. */
export function hasProduct(items: WishlistItem[], productId: string): boolean {
  return items.some((item) => item.productId === productId);
}

export function findItemByProduct(
  items: WishlistItem[],
  productId: string,
): WishlistItem | undefined {
  return items.find((item) => item.productId === productId);
}
