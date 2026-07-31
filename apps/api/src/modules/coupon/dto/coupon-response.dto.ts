import type { CouponStatus, CurrencyCode, DiscountType } from "../constants";

/** The public-facing shape of a Coupon. Adds `remainingUses` — a
 * read-only convenience computed by `mapper/` (via
 * `utils/coupon-usage.util.ts`), never stored. */
export interface CouponResponseDto {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  currency: CurrencyCode;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  status: CouponStatus;
  startsAt: Date | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  usageCount: number;
  remainingUses: number | null;
  stackable: boolean;
  eligibleUserIds: string[] | null;
  eligibleProductIds: string[] | null;
  eligibleCategoryIds: string[] | null;
  eligibleBrandIds: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}
