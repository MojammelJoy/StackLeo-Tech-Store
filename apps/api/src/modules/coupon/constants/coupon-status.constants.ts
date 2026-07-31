/**
 * A coupon's own lifecycle, set explicitly by an admin action —
 * `DRAFT` (not yet published) and `PAUSED`/`ARCHIVED` (deliberately
 * disabled) are distinct from `EXPIRED`/`EXHAUSTED`, which describe a
 * coupon that *would* still be active except that a date or usage-count
 * condition (see `utils/coupon-window.util.ts`,
 * `utils/coupon-usage.util.ts`) has been crossed. Keeping both kinds of
 * "not usable" apart preserves the reason a coupon can't be redeemed
 * right now, rather than collapsing everything into a single boolean.
 */
export const COUPON_STATUSES = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  EXPIRED: "expired",
  EXHAUSTED: "exhausted",
  ARCHIVED: "archived",
} as const;

export type CouponStatus = (typeof COUPON_STATUSES)[keyof typeof COUPON_STATUSES];
