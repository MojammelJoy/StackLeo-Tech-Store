import { getRemainingUses } from "../utils";

import type { CouponResponseDto, CouponValidationResponseDto } from "../dto";
import type { CouponMapper } from "../interfaces";
import type { Coupon, CouponValidationResult } from "../types";

function toResponseDto(coupon: Coupon): CouponResponseDto {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    currency: coupon.currency,
    maxDiscountAmount: coupon.maxDiscountAmount,
    minOrderAmount: coupon.minOrderAmount,
    status: coupon.status,
    startsAt: coupon.startsAt,
    expiresAt: coupon.expiresAt,
    usageLimit: coupon.usageLimit,
    usageLimitPerUser: coupon.usageLimitPerUser,
    usageCount: coupon.usageCount,
    remainingUses: getRemainingUses(coupon),
    stackable: coupon.stackable,
    eligibleUserIds: coupon.eligibleUserIds,
    eligibleProductIds: coupon.eligibleProductIds,
    eligibleCategoryIds: coupon.eligibleCategoryIds,
    eligibleBrandIds: coupon.eligibleBrandIds,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  };
}

function toResponseList(coupons: Coupon[]): CouponResponseDto[] {
  return coupons.map(toResponseDto);
}

function toValidationResponseDto(result: CouponValidationResult): CouponValidationResponseDto {
  return {
    valid: result.valid,
    coupon: result.coupon === null ? null : toResponseDto(result.coupon),
    errorCode: result.errorCode,
    errorMessage: result.errorMessage,
  };
}

/** The only place a `Coupon`/`CouponValidationResult` is converted to
 * its public response-DTO shape — callers map through this instead of
 * building the DTO by hand. */
export const couponMapper: CouponMapper = {
  toResponseDto,
  toResponseList,
  toValidationResponseDto,
};
