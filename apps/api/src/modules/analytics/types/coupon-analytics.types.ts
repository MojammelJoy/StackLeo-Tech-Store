/** `activeCoupons`/`inactiveCoupons` are current snapshots
 * (`Coupon.status`), not range-scoped; `totalRedemptions`/
 * `totalDiscountGiven` are scoped to `CouponRedemption.createdAt`
 * within the range, counting only active (`removedAt: null`)
 * redemptions — a removed redemption never counted as real usage in
 * the reporting sense. */
export interface CouponAnalyticsSummary {
  totalCoupons: number;
  activeCoupons: number;
  inactiveCoupons: number;
  totalRedemptions: number;
  totalDiscountGiven: number;
}

/** One coupon's redemption activity over a date range. */
export interface CouponPerformance {
  couponId: string;
  code: string;
  redemptionCount: number;
  totalDiscountGiven: number;
}
