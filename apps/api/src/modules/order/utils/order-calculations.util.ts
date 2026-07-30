import type { Order, OrderItem, OrderSummary } from "../types";

export function calculateItemCount(items: OrderItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function calculateLineTotal(item: Pick<OrderItem, "unitPrice" | "quantity">): number {
  return item.unitPrice * item.quantity;
}

/**
 * Builds an `OrderSummary` from a stored `Order` plus its items —
 * `itemCount` is computed, everything else is read directly off
 * `order` rather than recalculated (see `OrderSummary`'s comment in
 * `types/order-summary.types.ts` for why).
 */
export function buildOrderSummary(order: Order, items: OrderItem[]): OrderSummary {
  return {
    itemCount: calculateItemCount(items),
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    taxTotal: order.taxTotal,
    shippingTotal: order.shippingTotal,
    total: order.total,
    currency: order.currency,
  };
}
