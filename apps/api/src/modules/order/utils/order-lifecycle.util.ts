import { ORDER_STATUSES, PAYMENT_STATUSES } from "../constants";

import type { OrderStatus, PaymentStatus } from "../constants";

const NON_CANCELLABLE_STATUSES: readonly OrderStatus[] = [
  ORDER_STATUSES.COMPLETED,
  ORDER_STATUSES.CANCELLED,
  ORDER_STATUSES.REFUNDED,
];

const PAID_STATUSES: readonly PaymentStatus[] = [
  PAYMENT_STATUSES.PAID,
  PAYMENT_STATUSES.PARTIALLY_REFUNDED,
];

/** Whether an order in this status could still be cancelled — a pure check, not a transition: nothing here mutates an order or decides business rules beyond "which statuses are terminal." */
export function isCancellable(status: OrderStatus): boolean {
  return !NON_CANCELLABLE_STATUSES.includes(status);
}

export function isPaid(paymentStatus: PaymentStatus): boolean {
  return PAID_STATUSES.includes(paymentStatus);
}
