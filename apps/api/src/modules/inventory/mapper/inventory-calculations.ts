import { INVENTORY_STATUSES } from "../constants";

import type { InventoryStatus } from "../constants";

/**
 * `quantity - reservedQuantity`, floored at zero. The single source of
 * truth for "available" stock — never stored, always computed, so it
 * can never drift out of sync with the two numbers it's derived from.
 */
export function getAvailableQuantity(item: { quantity: number; reservedQuantity: number }): number {
  return Math.max(item.quantity - item.reservedQuantity, 0);
}

/**
 * What an item's stock status *would* be based purely on its numbers —
 * offered as a reusable calculation for a future concrete service to
 * apply when quantity changes, not applied automatically here. Never
 * resolves to `DISCONTINUED`: that's a lifecycle decision no quantity
 * comparison can make on its own, so a caller who wants to discontinue
 * an item sets that status directly rather than through this function.
 */
export function resolveStockStatus(
  availableQuantity: number,
  lowStockThreshold: number,
): InventoryStatus {
  if (availableQuantity <= 0) return INVENTORY_STATUSES.OUT_OF_STOCK;
  if (availableQuantity <= lowStockThreshold) return INVENTORY_STATUSES.LOW_STOCK;
  return INVENTORY_STATUSES.IN_STOCK;
}
