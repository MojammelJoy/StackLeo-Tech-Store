import type { InventoryItemResponseDto } from "./inventory-item-response.dto";

/** What `POST /inventory/:id/transfer` returns — both sides of the
 * transfer, already updated. */
export interface TransferStockResponseDto {
  source: InventoryItemResponseDto;
  destination: InventoryItemResponseDto;
}
