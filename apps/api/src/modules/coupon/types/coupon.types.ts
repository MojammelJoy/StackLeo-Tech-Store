import type { CouponStatus, CurrencyCode, DiscountType } from "../constants";

/**
 * `eligible*Ids` are bare FK-shaped string arrays, never relations —
 * this module never imports `modules/user`, `modules/product`,
 * `modules/category`, or `modules/brand`. `null` means "open to all"
 * for that dimension; a non-null (possibly empty) array means "restricted
 * to exactly these". `currency` is always required, even for
 * `PERCENTAGE`/`FREE_SHIPPING` coupons, because `minOrderAmount`/
 * `maxDiscountAmount` still need a currency to be meaningful.
 */
export interface Coupon {
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
  stackable: boolean;
  eligibleUserIds: string[] | null;
  eligibleProductIds: string[] | null;
  eligibleCategoryIds: string[] | null;
  eligibleBrandIds: string[] | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCouponInput {
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  currency: CurrencyCode;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  status?: CouponStatus;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  stackable?: boolean;
  eligibleUserIds?: string[] | null;
  eligibleProductIds?: string[] | null;
  eligibleCategoryIds?: string[] | null;
  eligibleBrandIds?: string[] | null;
}

/**
 * Deliberately excludes `code`/`discountType`/`discountValue`/`currency`
 * — a coupon's discount identity, left fixed once created (mirroring
 * `modules/payment`'s `UpdatePaymentInput` narrowness) so redemptions
 * already recorded against it stay meaningful.
 */
export interface UpdateCouponInput {
  description?: string | null;
  status?: CouponStatus;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  stackable?: boolean;
  eligibleUserIds?: string[] | null;
  eligibleProductIds?: string[] | null;
  eligibleCategoryIds?: string[] | null;
  eligibleBrandIds?: string[] | null;
}
