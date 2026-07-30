import { getAvailableQuantity } from "./inventory-calculations";

import type { InventoryItemResponseDto, InventoryMovementResponseDto } from "../dto";
import type { InventoryMapper } from "../interfaces";
import type { InventoryItem, InventoryMovement } from "../types";

function toResponseDto(item: InventoryItem): InventoryItemResponseDto {
  return {
    id: item.id,
    sku: item.sku,
    warehouseId: item.warehouseId,
    quantity: item.quantity,
    reservedQuantity: item.reservedQuantity,
    availableQuantity: getAvailableQuantity(item),
    lowStockThreshold: item.lowStockThreshold,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function toResponseList(items: InventoryItem[]): InventoryItemResponseDto[] {
  return items.map(toResponseDto);
}

function toMovementResponseDto(movement: InventoryMovement): InventoryMovementResponseDto {
  return {
    id: movement.id,
    inventoryItemId: movement.inventoryItemId,
    type: movement.type,
    quantity: movement.quantity,
    reason: movement.reason,
    createdAt: movement.createdAt,
  };
}

/**
 * The only place an `InventoryItem`/`InventoryMovement` is converted to
 * its public response DTO shape — callers map through this instead of
 * building either DTO by hand.
 */
export const inventoryMapper: InventoryMapper = {
  toResponseDto,
  toResponseList,
  toMovementResponseDto,
};
