import type { InventoryStatus } from "../constants";

/**
 * The public-facing shape of an InventoryItem. Unlike the domain entity,
 * this includes `availableQuantity` — a derived, read-only convenience
 * for API consumers, computed by `mapper/` (via
 * `inventory-calculations.ts`'s `getAvailableQuantity`), never stored.
 */
export interface InventoryItemResponseDto {
  id: string;
  sku: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  status: InventoryStatus;
  createdAt: Date;
  updatedAt: Date;
}
