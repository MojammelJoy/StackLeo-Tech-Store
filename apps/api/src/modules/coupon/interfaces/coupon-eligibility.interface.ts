import type { CurrencyCode } from "../constants";

/**
 * What `CouponService.evaluateCoupon` needs to know about the cart it's
 * evaluating a coupon against — bare FK-shaped ids, never relations, for
 * the same cross-module decoupling reason `Coupon`'s own `eligible*Ids`
 * fields are bare arrays (see `types/coupon.types.ts`). Built from a real
 * `CartSnapshotProvider` (never trusted from the request body) plus a
 * direct, read-only product lookup for `categoryIds`/`brandIds` — see
 * `service/coupon.service.ts`'s `buildEligibilityContext`.
 */
export interface EligibilityContext {
  userId?: string;
  orderAmount: number;
  currency: CurrencyCode;
  productIds: string[];
  categoryIds: string[];
  brandIds: string[];
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}
