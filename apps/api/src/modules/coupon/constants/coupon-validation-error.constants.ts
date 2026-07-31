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
} as const;

export type CouponValidationErrorCode =
  (typeof COUPON_VALIDATION_ERROR_CODES)[keyof typeof COUPON_VALIDATION_ERROR_CODES];
