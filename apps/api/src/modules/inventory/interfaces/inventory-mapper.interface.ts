import type {
  InventoryItemResponseDto,
  InventoryMovementResponseDto,
  TransferStockResponseDto,
} from "../dto";
import type { InventoryItem, InventoryMovement } from "../types";

/**
 * Contract `mapper/inventory.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation.
 */
export interface InventoryMapper {
  toResponseDto(item: InventoryItem): InventoryItemResponseDto;
  toResponseList(items: InventoryItem[]): InventoryItemResponseDto[];
  toMovementResponseDto(movement: InventoryMovement): InventoryMovementResponseDto;
  toMovementResponseList(movements: InventoryMovement[]): InventoryMovementResponseDto[];
  toTransferResponseDto(
    source: InventoryItem,
    destination: InventoryItem,
  ): TransferStockResponseDto;
}
