import type { InventoryStatus } from "../constants";

/**
 * Inventory-specific filter criteria, layered on top of `common/`'s
 * generic `ParsedQuery` (pagination/sort/search). Shared between
 * `repository/` (the contract) and `service/`.
 */
export interface InventoryFilterOptions {
  warehouseId?: string;
  status?: InventoryStatus;
  sku?: string;
}
