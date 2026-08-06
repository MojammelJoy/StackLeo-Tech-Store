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

/**
 * The valid next statuses from each `PaymentStatus` — "maintain payment
 * status lifecycle" enforced as data, not scattered `if`s, mirroring
 * `modules/order`'s identical `ORDER_STATUS_TRANSITIONS`. `PENDING` can
 * reach `SUCCEEDED` directly (cash on delivery marked collected — no
 * gateway `PROCESSING` phase exists for it) as well as `PROCESSING`
 * (a gateway charge was attempted). `FAILED`/`CANCELLED`/`REFUNDED` are
 * all terminal for *this* payment record — a failed or cancelled
 * payment is retried by creating a new `Payment` row (see
 * `PaymentRepository`'s doc comment), never by resurrecting the old
 * one. `utils/payment-status.util.ts`'s `canTransitionPaymentStatus` is
 * the only place this map is read.
 */
export const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  [PAYMENT_STATUSES.PENDING]: [
    PAYMENT_STATUSES.PROCESSING,
    PAYMENT_STATUSES.SUCCEEDED,
    PAYMENT_STATUSES.FAILED,
    PAYMENT_STATUSES.CANCELLED,
  ],
  [PAYMENT_STATUSES.PROCESSING]: [
    PAYMENT_STATUSES.SUCCEEDED,
    PAYMENT_STATUSES.FAILED,
    PAYMENT_STATUSES.CANCELLED,
  ],
  [PAYMENT_STATUSES.SUCCEEDED]: [PAYMENT_STATUSES.PARTIALLY_REFUNDED, PAYMENT_STATUSES.REFUNDED],
  [PAYMENT_STATUSES.PARTIALLY_REFUNDED]: [PAYMENT_STATUSES.REFUNDED],
  [PAYMENT_STATUSES.FAILED]: [],
  [PAYMENT_STATUSES.CANCELLED]: [],
  [PAYMENT_STATUSES.REFUNDED]: [],
};
