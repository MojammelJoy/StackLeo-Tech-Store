import { PAYMENT_TRANSACTION_STATUSES, PAYMENT_TRANSACTION_TYPES } from "../constants";

import type { Payment, PaymentTransaction } from "../types";

/**
 * How much of `payment` can still be refunded — its total amount minus
 * every succeeded refund transaction recorded against it so far. Pure
 * arithmetic over already-loaded data; issuing an actual refund is
 * `service/`'s (and, ultimately, a `PaymentProvider`'s) job.
 */
export function getRefundableAmount(payment: Payment, transactions: PaymentTransaction[]): number {
  const refundedAmount = transactions
    .filter(
      (transaction) =>
        transaction.type === PAYMENT_TRANSACTION_TYPES.REFUND &&
        transaction.status === PAYMENT_TRANSACTION_STATUSES.SUCCEEDED,
    )
    .reduce((sum, transaction) => sum + transaction.amount.amount, 0);

  return Math.max(payment.amount - refundedAmount, 0);
}
