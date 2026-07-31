import type { Coupon } from "../types";

/** Whether `coupon`'s global `usageLimit` has been reached. Per-user
 * limits (`usageLimitPerUser`) require a per-user redemption count that
 * isn't stored on `Coupon` itself — see `repository/`'s
 * `countUserRedemptions`, which a future concrete service uses for that
 * check instead. */
export function isUsageLimitReached(coupon: Coupon): boolean {
  return coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit;
}

/** `null` means unlimited. Never negative — a coupon that has somehow
 * exceeded its own limit still reports `0` remaining, not a negative
 * count. */
export function getRemainingUses(coupon: Coupon): number | null {
  if (coupon.usageLimit === null) {
    return null;
  }
  return Math.max(coupon.usageLimit - coupon.usageCount, 0);
}
