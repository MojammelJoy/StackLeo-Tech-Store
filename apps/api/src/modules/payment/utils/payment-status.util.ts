import { PAYMENT_STATUS_TRANSITIONS, PAYMENT_STATUSES } from "../constants";

import type { PaymentStatus } from "../constants";

const REFUNDABLE_STATUSES: readonly PaymentStatus[] = [
  PAYMENT_STATUSES.SUCCEEDED,
  PAYMENT_STATUSES.PARTIALLY_REFUNDED,
];

/** A payment can only be cancelled before any money has actually moved
 * — once it's `SUCCEEDED` (even partially refunded since), calling it
 * off requires a refund, not a cancellation. */
const CANCELLABLE_STATUSES: readonly PaymentStatus[] = [
  PAYMENT_STATUSES.PENDING,
  PAYMENT_STATUSES.PROCESSING,
];

/** Whether a payment in `status` can still have a refund issued against
 * it — it must have actually succeeded (fully or partially) at some
 * point. */
export function isRefundable(status: PaymentStatus): boolean {
  return REFUNDABLE_STATUSES.includes(status);
}

/** Whether a payment in `status` represents money the merchant has
 * actually received. */
export function isSuccessful(status: PaymentStatus): boolean {
  return status === PAYMENT_STATUSES.SUCCEEDED;
}

/** Whether a payment in `status` can still be cancelled — a pure check,
 * not a transition, mirroring `modules/order`'s `isCancellable`. */
export function isCancellable(status: PaymentStatus): boolean {
  return CANCELLABLE_STATUSES.includes(status);
}

/** Whether `from` may transition directly to `to` per
 * `PAYMENT_STATUS_TRANSITIONS` — the single source of truth for
 * "maintain payment status lifecycle", mirroring `modules/order`'s
 * `canTransitionOrderStatus`. */
export function canTransitionPaymentStatus(from: PaymentStatus, to: PaymentStatus): boolean {
  return PAYMENT_STATUS_TRANSITIONS[from].includes(to);
}
