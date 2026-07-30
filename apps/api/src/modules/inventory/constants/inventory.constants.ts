export const INVENTORY_SKU_MAX_LENGTH = 64;
export const INVENTORY_QUANTITY_MIN = 0;
export const INVENTORY_LOW_STOCK_THRESHOLD_DEFAULT = 10;
export const INVENTORY_MOVEMENT_REASON_MAX_LENGTH = 500;

/**
 * The stock status of an inventory item. `IN_STOCK`/`LOW_STOCK`/
 * `OUT_OF_STOCK` can be derived from `quantity`/`reservedQuantity`/
 * `lowStockThreshold` (see `mapper/inventory-calculations.ts`'s
 * `resolveStockStatus`) — `DISCONTINUED` cannot, since it's a lifecycle
 * decision, not a stock-level fact. `status` is still a stored field:
 * this foundation offers the derivation as a reusable calculation for a
 * future service to apply, it doesn't apply it automatically.
 */
export const INVENTORY_STATUSES = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
  DISCONTINUED: "discontinued",
} as const;

export type InventoryStatus = (typeof INVENTORY_STATUSES)[keyof typeof INVENTORY_STATUSES];

/**
 * Inventory movement types — the foundation for an eventual stock ledger.
 * Recording a movement and applying its effect to an item's quantity are
 * two different concerns; this foundation only defines the vocabulary
 * and the contract to record one (see `InventoryRepository.recordMovement`),
 * not the arithmetic that would apply it.
 */
export const INVENTORY_MOVEMENT_TYPES = {
  STOCK_IN: "stock_in",
  STOCK_OUT: "stock_out",
  RESERVATION: "reservation",
  RELEASE: "release",
  ADJUSTMENT: "adjustment",
} as const;

export type InventoryMovementType =
  (typeof INVENTORY_MOVEMENT_TYPES)[keyof typeof INVENTORY_MOVEMENT_TYPES];

/**
 * Fields the (not-yet-built) inventory listing endpoint will allow
 * sorting and filtering by, passed as `allowedFields` to `common/`'s
 * `parseSortParams`/`parseFilterParams`.
 */
export const INVENTORY_SORTABLE_FIELDS = ["sku", "quantity", "createdAt", "updatedAt"] as const;
export const INVENTORY_FILTERABLE_FIELDS = ["warehouseId", "status"] as const;
