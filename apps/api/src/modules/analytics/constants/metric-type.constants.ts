/**
 * The 8 analytics domains this foundation is designed to support.
 * `Analytics` never imports `modules/product`, `modules/order`,
 * `modules/payment`, `modules/coupon`, etc. to define this — it's a
 * flat catalog of bare string keys, the same cross-module decoupling
 * every foundation in this app follows.
 */
export const METRIC_TYPES = {
  SALES: "sales",
  REVENUE: "revenue",
  PRODUCT: "product",
  INVENTORY: "inventory",
  CUSTOMER: "customer",
  ORDER: "order",
  PAYMENT: "payment",
  COUPON: "coupon",
} as const;

export type MetricType = (typeof METRIC_TYPES)[keyof typeof METRIC_TYPES];
