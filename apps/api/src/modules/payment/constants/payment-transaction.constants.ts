/** A single gateway interaction against a `Payment` — see
 * `types/payment-transaction.types.ts`. A payment can accumulate several
 * of these over its life (an authorization, then a capture, then one or
 * more refunds). */
export const PAYMENT_TRANSACTION_TYPES = {
  AUTHORIZATION: "authorization",
  CAPTURE: "capture",
  REFUND: "refund",
  VERIFICATION: "verification",
} as const;

export type PaymentTransactionType =
  (typeof PAYMENT_TRANSACTION_TYPES)[keyof typeof PAYMENT_TRANSACTION_TYPES];

export const PAYMENT_TRANSACTION_STATUSES = {
  PENDING: "pending",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
} as const;

export type PaymentTransactionStatus =
  (typeof PAYMENT_TRANSACTION_STATUSES)[keyof typeof PAYMENT_TRANSACTION_STATUSES];
