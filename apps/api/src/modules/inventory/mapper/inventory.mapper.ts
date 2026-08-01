import { getAvailableQuantity } from "./inventory-calculations";

import type {
  InventoryItemResponseDto,
  InventoryMovementResponseDto,
  TransferStockResponseDto,
} from "../dto";
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
    version: item.version,
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
    relatedItemId: movement.relatedItemId,
    createdAt: movement.createdAt,
  };
}

function toMovementResponseList(movements: InventoryMovement[]): InventoryMovementResponseDto[] {
  return movements.map(toMovementResponseDto);
}

function toTransferResponseDto(
  source: InventoryItem,
  destination: InventoryItem,
): TransferStockResponseDto {
  return { source: toResponseDto(source), destination: toResponseDto(destination) };
}

/**
 * The only place an `InventoryItem`/`InventoryMovement` is converted to
 * its public response DTO shape — callers map through this instead of
 * building any of these DTOs by hand.
 */
export const inventoryMapper: InventoryMapper = {
  toResponseDto,
  toResponseList,
  toMovementResponseDto,
  toMovementResponseList,
  toTransferResponseDto,
};
