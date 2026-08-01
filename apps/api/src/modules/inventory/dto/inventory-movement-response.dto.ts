import type { InventoryMovementType } from "../constants";

export interface InventoryMovementResponseDto {
  id: string;
  inventoryItemId: string;
  type: InventoryMovementType;
  quantity: number;
  reason: string | null;
  relatedItemId: string | null;
  createdAt: Date;
}
