/** Why `service/coupon.service.ts`'s `validate` rejected a code — feeds
 * `types/coupon-validation.types.ts`'s `CouponValidationResult`. */
export const COUPON_VALIDATION_ERROR_CODES = {
  NOT_FOUND: "not_found",
  INACTIVE: "inactive",
  NOT_STARTED: "not_started",
  EXPIRED: "expired",
  USAGE_LIMIT_REACHED: "usage_limit_reached",
  USER_USAGE_LIMIT_REACHED: "user_usage_limit_reached",
  MIN_ORDER_AMOUNT_NOT_MET: "min_order_amount_not_met",
  NOT_ELIGIBLE: "not_eligible",
  /** The coupon's own `currency` doesn't match the cart's — comparing
   * `minOrderAmount`/`maxDiscountAmount` (both minor-unit amounts in the
   * coupon's currency) against a cart total in a different currency
   * would produce a meaningless number, so this is checked and reported
   * before any amount comparison runs. */
  CURRENCY_MISMATCH: "currency_mismatch",
} as const;

export type CouponValidationErrorCode =
  (typeof COUPON_VALIDATION_ERROR_CODES)[keyof typeof COUPON_VALIDATION_ERROR_CODES];
