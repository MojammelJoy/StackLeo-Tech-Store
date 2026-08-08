/** A current snapshot — inventory status has no meaningful "date range"
 * of its own (see `InventoryMovementSummary` for the range-scoped
 * ledger view). */
export interface InventoryAnalyticsSummary {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
}

/** One `InventoryMovement.type`'s count/quantity within a date range —
 * "stock additions"/"stock deductions" are read directly off this
 * (`stock_in`/`transfer_in` vs `stock_out`/`transfer_out`), never a
 * separate calculation. */
export interface InventoryMovementTypeBreakdown {
  type: string;
  movementCount: number;
  totalQuantity: number;
}

export interface InventoryMovementSummary {
  totalMovements: number;
  stockAdditions: number;
  stockDeductions: number;
  byType: InventoryMovementTypeBreakdown[];
}

/** One inventory item's movement frequency within a date range —
 * "most frequently adjusted products". */
export interface InventoryAdjustmentRanking {
  inventoryItemId: string;
  sku: string;
  warehouseId: string;
  movementCount: number;
  totalQuantity: number;
}
