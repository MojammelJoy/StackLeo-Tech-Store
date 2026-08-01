import type { InventoryStatus } from "../constants";

/**
 * The public-facing shape of an InventoryItem. Unlike the domain entity,
 * this includes `availableQuantity` — a derived, read-only convenience
 * for API consumers, computed by `mapper/` (via
 * `inventory-calculations.ts`'s `getAvailableQuantity`), never stored.
 * `version` is exposed so a client performing a stock mutation can
 * display/track it if needed, though every mutation endpoint reads the
 * current version itself rather than trusting one a client supplies.
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
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
