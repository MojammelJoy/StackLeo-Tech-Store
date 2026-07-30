export const PRODUCT_NAME_MIN_LENGTH = 2;
export const PRODUCT_NAME_MAX_LENGTH = 200;
export const PRODUCT_DESCRIPTION_MAX_LENGTH = 5000;
export const PRODUCT_SKU_MAX_LENGTH = 64;

/** ISO 4217 currency code length, e.g. "USD". */
export const PRODUCT_CURRENCY_CODE_LENGTH = 3;

/** Minor currency unit (e.g. cents for USD) — never negative. */
export const PRODUCT_PRICE_MIN = 0;

/**
 * The product lifecycle. A generic draft/active/archived flow — no
 * business rules about transitions between them exist anywhere in this
 * codebase yet.
 */
export const PRODUCT_STATUSES = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[keyof typeof PRODUCT_STATUSES];

/**
 * Fields the (not-yet-built) product listing endpoint will allow sorting
 * and filtering by, passed as `allowedFields` to `common/`'s
 * `parseSortParams`/`parseFilterParams`.
 */
export const PRODUCT_SORTABLE_FIELDS = ["name", "price", "createdAt", "updatedAt"] as const;
export const PRODUCT_FILTERABLE_FIELDS = ["categoryId", "status"] as const;
