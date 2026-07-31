export const COUPON_CODE_MIN_LENGTH = 3;
export const COUPON_CODE_MAX_LENGTH = 32;
export const COUPON_DESCRIPTION_MAX_LENGTH = 500;
export const COUPON_PERCENTAGE_MIN = 1;
export const COUPON_PERCENTAGE_MAX = 100;

/**
 * Fields the (not-yet-built) coupon listing endpoint will allow sorting
 * and filtering by, passed as `allowedFields` to `common/`'s
 * `parseSortParams`/`parseFilterParams`.
 */
export const COUPON_SORTABLE_FIELDS = [
  "code",
  "createdAt",
  "updatedAt",
  "expiresAt",
  "usageCount",
] as const;
export const COUPON_FILTERABLE_FIELDS = ["status", "discountType", "stackable"] as const;
