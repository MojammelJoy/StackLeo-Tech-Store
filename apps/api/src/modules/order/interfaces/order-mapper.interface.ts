import type { OrderItemResponseDto, OrderResponseDto, OrderSummaryDto } from "../dto";
import type { Order, OrderItem } from "../types";

/**
 * Contract `mapper/order.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation.
 */
export interface OrderMapper {
  toItemResponseDto(item: OrderItem): OrderItemResponseDto;
  toItemResponseList(items: OrderItem[]): OrderItemResponseDto[];
  toSummaryDto(order: Order, items: OrderItem[]): OrderSummaryDto;
  toOrderResponseDto(order: Order, items: OrderItem[]): OrderResponseDto;
}
