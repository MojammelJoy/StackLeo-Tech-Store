/**
 * A payment's own lifecycle. Deliberately independent of
 * `modules/order`'s `PAYMENT_STATUSES` copy — that enum describes what
 * an order's payment *looks like from the order's perspective* (and is
 * never imported here; see `types/payment.types.ts` on `orderId`), while
 * this one is the payment record's actual source of truth. Keeping them
 * separate, even though the vocabularies overlap, is the same
 * cross-module decoupling discipline every other foundation in this app
 * follows.
 */
export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  PARTIALLY_REFUNDED: "partially_refunded",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
