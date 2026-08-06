export const ORDER_NUMBER_SEQUENCE_PAD_LENGTH = 6;
export const ORDER_NOTES_MAX_LENGTH = 1000;
export const ORDER_COUPON_CODE_MAX_LENGTH = 50;
export const ORDER_ITEM_MIN_QUANTITY = 1;
export const ORDER_ITEM_MAX_QUANTITY = 99;
export const ORDER_MIN_ITEM_COUNT = 1;
export const ORDER_CURRENCY_CODE_LENGTH = 3;

/**
 * An order's overall lifecycle — the "meta" status. Deliberately
 * separate from `PAYMENT_STATUSES`/`FULFILLMENT_STATUSES`: an order can
 * be `CONFIRMED` while payment is still `PENDING` (cash on delivery) or
 * while fulfillment hasn't started, so collapsing all three into one
 * enum would lose real, independent information.
 */
export const ORDER_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

/** Independent of `ORDER_STATUSES` — see that constant's comment. `AUTHORIZED` supports auth-then-capture card flows distinct from a completed capture (`PAID`). */
export const PAYMENT_STATUSES = {
  PENDING: "pending",
  AUTHORIZED: "authorized",
  PAID: "paid",
  FAILED: "failed",
  PARTIALLY_REFUNDED: "partially_refunded",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

/** Independent of `ORDER_STATUSES` — see that constant's comment. */
export const FULFILLMENT_STATUSES = {
  UNFULFILLED: "unfulfilled",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  RETURNED: "returned",
} as const;

export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[keyof typeof FULFILLMENT_STATUSES];

export const ORDER_SORTABLE_FIELDS = ["createdAt", "updatedAt", "total"] as const;
export const ORDER_FILTERABLE_FIELDS = ["status", "paymentStatus", "fulfillmentStatus"] as const;

/**
 * The valid next statuses from each `OrderStatus` — "Support order
 * status workflow" enforced as data, not scattered `if`s. Only
 * `COMPLETED` moves to `REFUNDED` (there must be something delivered to
 * refund; a merely `CANCELLED` order was never fulfilled, so there's
 * nothing to reverse) — `CANCELLED` and `REFUNDED` are both terminal,
 * nothing transitions out of either. `utils/order-lifecycle.util.ts`'s
 * `canTransitionOrderStatus` is the only place this map is read.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.CONFIRMED]: [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PROCESSING]: [ORDER_STATUSES.COMPLETED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.COMPLETED]: [ORDER_STATUSES.REFUNDED],
  [ORDER_STATUSES.CANCELLED]: [],
  [ORDER_STATUSES.REFUNDED]: [],
};
