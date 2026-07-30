import type { CartItem } from "../types";

/** Items currently marked for checkout — what `CartSummary` is computed from. */
export function getSelectedItems(items: CartItem[]): CartItem[] {
  return items.filter((item) => item.selected);
}
