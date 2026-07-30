import { buildOrderSummary, calculateLineTotal } from "../utils";

import type { OrderItemResponseDto, OrderResponseDto, OrderSummaryDto } from "../dto";
import type { OrderMapper } from "../interfaces";
import type { Order, OrderItem } from "../types";

function toItemResponseDto(item: OrderItem): OrderItemResponseDto {
  return {
    id: item.id,
    productId: item.productId,
    sku: item.sku,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: calculateLineTotal(item),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function toItemResponseList(items: OrderItem[]): OrderItemResponseDto[] {
  return items.map(toItemResponseDto);
}

function toSummaryDto(order: Order, items: OrderItem[]): OrderSummaryDto {
  return buildOrderSummary(order, items);
}

function toOrderResponseDto(order: Order, items: OrderItem[]): OrderResponseDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    guestEmail: order.guestEmail,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    billingAddressId: order.billingAddressId,
    shippingAddressId: order.shippingAddressId,
    couponCode: order.couponCode,
    notes: order.notes,
    items: toItemResponseList(items),
    summary: toSummaryDto(order, items),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

/**
 * The only place an `Order`/`OrderItem` is converted to its public
 * response DTO shape(s) — callers map through this instead of building
 * any of them by hand.
 */
export const orderMapper: OrderMapper = {
  toItemResponseDto,
  toItemResponseList,
  toSummaryDto,
  toOrderResponseDto,
};
