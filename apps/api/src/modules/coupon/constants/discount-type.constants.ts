/**
 * What kind of discount a coupon grants. `discountValue`'s meaning (see
 * `types/coupon.types.ts`) depends on which of these is selected: a
 * minor-unit amount for `FIXED_AMOUNT`, whole percentage points for
 * `PERCENTAGE`, and always `0` for `FREE_SHIPPING` — enforced by
 * `validation/create-coupon.schema.ts`'s cross-field checks.
 */
export const DISCOUNT_TYPES = {
  FIXED_AMOUNT: "fixed_amount",
  PERCENTAGE: "percentage",
  FREE_SHIPPING: "free_shipping",
} as const;

export type DiscountType = (typeof DISCOUNT_TYPES)[keyof typeof DISCOUNT_TYPES];
