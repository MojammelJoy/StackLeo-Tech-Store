import { PAYMENT_STATUSES } from "../constants";

import type { PaymentStatus } from "../constants";

const REFUNDABLE_STATUSES: readonly PaymentStatus[] = [
  PAYMENT_STATUSES.SUCCEEDED,
  PAYMENT_STATUSES.PARTIALLY_REFUNDED,
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
