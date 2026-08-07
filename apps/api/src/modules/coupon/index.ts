/**
 * The full Coupon API: domain types (`Coupon`/`CouponRedemption`, keyed
 * to eligible users/products/categories/brands via bare FK-string arrays
 * — see `types/coupon.types.ts`), DTOs + Zod validation schemas, the
 * repository contracts (`CouponRepository` plus its real Prisma
 * implementation, and the read-only `ProductCategoryLookupRepository`
 * this module uses instead of importing `modules/product`), the real
 * `CouponService` (admin CRUD, soft delete/restore, and cart
 * integration — validate/apply/remove, with usage-limit, expiration,
 * minimum-order-amount, and eligibility enforcement), the Coupon
 * mapper, controllers/routes, and the code/window/usage/status/discount
 * utilities that support it all.
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

export type {
  CreateCouponInput,
  Coupon,
  CouponRedemption,
  CouponValidationResult,
  CreateCouponRedemptionInput,
  UpdateCouponInput,
} from "./types";

export {
  amountSchema,
  couponCodeSchema,
  currencyCodeSchema,
  descriptionSchema,
  discountValueSchema,
} from "./schemas";

export {
  applyCouponSchema,
  couponCodeParamsSchema,
  couponIdParamsSchema,
  createCouponSchema,
  updateCouponSchema,
} from "./validation";
export type {
  ApplyCouponDto,
  CreateCouponDto,
  CouponApplicationResponseDto,
  CouponResponseDto,
  CouponValidationResponseDto,
  UpdateCouponDto,
} from "./dto";

export type {
  CartCouponSnapshot,
  CartSnapshotProvider,
  CouponFilterOptions,
  CouponMapper,
  EligibilityContext,
  EligibilityResult,
} from "./interfaces";

export { couponMapper } from "./mapper";

export {
  calculateDiscount,
  getRemainingUses,
  hasStarted,
  isExpired,
  isRedeemable,
  isUsageLimitReached,
  isWithinActiveWindow,
  normalizeCouponCode,
} from "./utils";

export { CouponPrismaRepository, ProductCategoryLookupPrismaRepository } from "./repository";
export type {
  CouponLookupOptions,
  CouponRepository,
  ProductCategoryFacts,
  ProductCategoryLookupRepository,
} from "./repository";

export { CouponService } from "./service";

export { CouponController } from "./controller";

export { couponRouter } from "./routes";
