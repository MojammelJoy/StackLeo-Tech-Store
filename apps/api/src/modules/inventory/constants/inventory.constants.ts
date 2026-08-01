export const INVENTORY_SKU_MAX_LENGTH = 64;
export const INVENTORY_QUANTITY_MIN = 0;
export const INVENTORY_LOW_STOCK_THRESHOLD_DEFAULT = 10;
export const INVENTORY_MOVEMENT_REASON_MAX_LENGTH = 500;

/**
 * How many times `service/inventory.service.ts`'s `withOptimisticRetry`
 * re-reads an item and reapplies a stock mutation after losing an
 * optimistic-concurrency race (see `InventoryItem.version`'s doc
 * comment in `prisma/schema.prisma`) before giving up and surfacing the
 * conflict to the caller. Three is enough to absorb ordinary contention
 * (a handful of concurrent requests against the same hot item) without
 * masking a genuinely stuck/looping caller.
 */
export const INVENTORY_MAX_OPTIMISTIC_RETRY_ATTEMPTS = 3;

/**
 * The stock status of an inventory item. `IN_STOCK`/`LOW_STOCK`/
 * `OUT_OF_STOCK` can be derived from `quantity`/`reservedQuantity`/
 * `lowStockThreshold` (see `mapper/inventory-calculations.ts`'s
 * `resolveStockStatus`) — `DISCONTINUED` cannot, since it's a lifecycle
 * decision, not a stock-level fact. `status` is still a stored field:
 * every stock-mutating operation in `service/inventory.service.ts`
 * recomputes and applies it automatically, *unless* the item is
 * currently `DISCONTINUED`, which persists until manually changed.
 */
export const INVENTORY_STATUSES = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
  DISCONTINUED: "discontinued",
} as const;

export type InventoryStatus = (typeof INVENTORY_STATUSES)[keyof typeof INVENTORY_STATUSES];

/**
 * Inventory movement types — the vocabulary for this module's
 * append-only stock ledger (see `prisma/schema.prisma`'s
 * `InventoryMovement`). `TRANSFER_OUT`/`TRANSFER_IN` are always
 * recorded as a pair (one per item, linked via
 * `InventoryMovement.relatedItemId`) by `InventoryService.transferStock`
 * — never used individually.
 */
export const INVENTORY_MOVEMENT_TYPES = {
  STOCK_IN: "stock_in",
  STOCK_OUT: "stock_out",
  RESERVATION: "reservation",
  RELEASE: "release",
  ADJUSTMENT: "adjustment",
  TRANSFER_IN: "transfer_in",
  TRANSFER_OUT: "transfer_out",
} as const;

export type InventoryMovementType =
  (typeof INVENTORY_MOVEMENT_TYPES)[keyof typeof INVENTORY_MOVEMENT_TYPES];

/**
 * Fields the inventory listing endpoint allows sorting and filtering
 * by, passed as `allowedFields` to `common/`'s `parseSortParams`/
 * `parseFilterParams`.
 */
export const INVENTORY_SORTABLE_FIELDS = ["sku", "quantity", "createdAt", "updatedAt"] as const;
export const INVENTORY_FILTERABLE_FIELDS = ["warehouseId", "status", "sku"] as const;
