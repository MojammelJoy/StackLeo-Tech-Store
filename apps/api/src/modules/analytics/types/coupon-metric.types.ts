import type { TimeGranularity } from "../constants";

/** `couponCode` is a bare string; this module never imports
 * `modules/coupon`. */
export interface CouponMetric {
  couponCode: string;
  period: Date;
  granularity: TimeGranularity;
  redemptionCount: number;
  totalDiscountGiven: number;
}
