import { DISCOUNT_TYPES } from "../constants";

import type { Coupon } from "../types";

/**
 * The single place a coupon's discount is turned into a minor-unit
 * amount — "calculate final discount safely": never negative, never
 * fractional (percentage discounts are floored to the nearest minor
 * unit), and never larger than `orderAmount` itself, regardless of what
 * `discountValue`/`maxDiscountAmount` say. `FREE_SHIPPING` always
 * resolves to `0` here — it discounts a shipping cost no module in this
 * app computes yet, so the coupon's presence (not a returned amount) is
 * the signal a future shipping module would read.
 */
export function calculateDiscount(coupon: Coupon, orderAmount: number): number {
  let rawDiscount: number;

  switch (coupon.discountType) {
    case DISCOUNT_TYPES.FIXED_AMOUNT:
      rawDiscount = coupon.discountValue;
      break;
    case DISCOUNT_TYPES.PERCENTAGE:
      rawDiscount = Math.floor((orderAmount * coupon.discountValue) / 100);
      break;
    case DISCOUNT_TYPES.FREE_SHIPPING:
      rawDiscount = 0;
      break;
    default:
      rawDiscount = 0;
  }

  if (coupon.maxDiscountAmount !== null) {
    rawDiscount = Math.min(rawDiscount, coupon.maxDiscountAmount);
  }

  return Math.max(0, Math.min(rawDiscount, orderAmount));
}
