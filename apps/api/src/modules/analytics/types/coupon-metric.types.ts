import type { TimeGranularity } from "../constants";

/**
 * One time-bucketed, store-wide coupon-redemption data point — the
 * generic `/metrics?metricType=coupon` series. Per-coupon breakdown
 * (this foundation's original shape modeled a `couponCode` per point)
 * belongs to the bounded `getTopCoupons` ranking instead (see
 * `types/coupon-analytics.types.ts`'s `CouponPerformance`).
 */
export interface CouponMetric {
  period: Date;
  granularity: TimeGranularity;
  redemptionCount: number;
  totalDiscountGiven: number;
}
