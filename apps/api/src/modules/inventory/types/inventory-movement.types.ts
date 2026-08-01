import type { InventoryMovementType } from "../constants";

/**
 * A single recorded stock movement — this module's append-only audit
 * trail of how an item's quantity changed over time. `quantity` is
 * always a positive magnitude; direction is implied entirely by `type`
 * (e.g. `STOCK_OUT` decreases the item's quantity, `STOCK_IN` increases
 * it). `relatedItemId` is set only for `TRANSFER_IN`/`TRANSFER_OUT`
 * movements — see `prisma/schema.prisma`'s `InventoryMovement` doc
 * comment.
 */
export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  type: InventoryMovementType;
  quantity: number;
  reason: string | null;
  relatedItemId: string | null;
  createdAt: Date;
}

export interface CreateInventoryMovementInput {
  inventoryItemId: string;
  type: InventoryMovementType;
  quantity: number;
  reason?: string | null;
  relatedItemId?: string | null;
}
