/**
 * Reusable coupon infrastructure: domain types (`Coupon`, keyed to
 * eligible users/products/categories/brands via bare FK-string arrays —
 * see `types/coupon.types.ts`), DTOs + Zod validation schemas (built
 * from reusable field-level schemas in `schemas/`), the repository
 * contract (plus its currently-skeletal Prisma implementation), a
 * skeleton service, the coupon mapper, and the code/window/usage/status
 * utilities that support it all. No controllers, routes, business
 * logic, actual discount calculation, or order/payment integration live
 * here.
 */
export {
  COUPON_CODE_MAX_LENGTH,
  COUPON_CODE_MIN_LENGTH,
  COUPON_DESCRIPTION_MAX_LENGTH,
  COUPON_FILTERABLE_FIELDS,
  COUPON_PERCENTAGE_MAX,
  COUPON_PERCENTAGE_MIN,
  COUPON_SORTABLE_FIELDS,
  COUPON_STATUSES,
  COUPON_VALIDATION_ERROR_CODES,
  DEFAULT_CURRENCY,
  DISCOUNT_TYPES,
  SUPPORTED_CURRENCIES,
} from "./constants";
export type {
  CouponStatus,
  CouponValidationErrorCode,
  CurrencyCode,
  DiscountType,
} from "./constants";

export type { CreateCouponInput, Coupon, CouponValidationResult, UpdateCouponInput } from "./types";

export {
  amountSchema,
  couponCodeSchema,
  currencyCodeSchema,
  descriptionSchema,
  discountValueSchema,
} from "./schemas";

export { applyCouponSchema, createCouponSchema, updateCouponSchema } from "./validation";
export type {
  ApplyCouponDto,
  CreateCouponDto,
  CouponResponseDto,
  CouponValidationResponseDto,
  UpdateCouponDto,
} from "./dto";

export type {
  CouponFilterOptions,
  CouponMapper,
  EligibilityContext,
  EligibilityResult,
} from "./interfaces";

export { couponMapper } from "./mapper";

export {
  getRemainingUses,
  hasStarted,
  isExpired,
  isRedeemable,
  isUsageLimitReached,
  isWithinActiveWindow,
  normalizeCouponCode,
} from "./utils";

export { CouponPrismaRepository } from "./repository";
export type { CouponRepository } from "./repository";

export { CouponService } from "./service";
