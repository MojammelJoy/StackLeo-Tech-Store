import { COUPON_STATUSES } from "../constants";

import { isUsageLimitReached } from "./coupon-usage.util";
import { isWithinActiveWindow } from "./coupon-window.util";

import type { Coupon } from "../types";

/** Whether `coupon` can be redeemed right now — combines its explicit
 * `status` with the date-window and usage-limit predicates. Does not
 * check per-user limits or product/category/brand/user eligibility
 * (see `interfaces/coupon-eligibility.interface.ts`); that requires
 * order/cart context this pure function doesn't have. */
export function isRedeemable(coupon: Coupon, now: Date = new Date()): boolean {
  return (
    coupon.status === COUPON_STATUSES.ACTIVE &&
    isWithinActiveWindow(coupon, now) &&
    !isUsageLimitReached(coupon)
  );
}
