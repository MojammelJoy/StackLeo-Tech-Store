import type { InventoryMovementType } from "../constants";

/**
 * A single recorded stock movement — the foundation for an eventual
 * ledger of how an item's quantity changed over time. `quantity` is
 * always a positive magnitude; direction is implied entirely by `type`
 * (e.g. `STOCK_OUT` decreases the item's quantity, `STOCK_IN` increases
 * it) — this foundation records that intent, it does not apply it.
 */
export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  type: InventoryMovementType;
  quantity: number;
  reason: string | null;
  createdAt: Date;
}

export interface CreateInventoryMovementInput {
  inventoryItemId: string;
  type: InventoryMovementType;
  quantity: number;
  reason?: string | null;
}
