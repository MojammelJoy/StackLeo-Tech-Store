export const PRODUCT_NAME_MIN_LENGTH = 2;
export const PRODUCT_NAME_MAX_LENGTH = 200;
export const PRODUCT_DESCRIPTION_MAX_LENGTH = 5000;
export const PRODUCT_SKU_MAX_LENGTH = 64;
export const PRODUCT_SLUG_MAX_LENGTH = 220;

/** ISO 4217 currency code length, e.g. "USD". */
export const PRODUCT_CURRENCY_CODE_LENGTH = 3;

/** Minor currency unit (e.g. cents for USD) — never negative. */
export const PRODUCT_PRICE_MIN = 0;

export const PRODUCT_TAG_MAX_LENGTH = 50;
export const PRODUCT_MAX_TAGS = 25;

export const PRODUCT_SEO_TITLE_MAX_LENGTH = 70;
export const PRODUCT_SEO_DESCRIPTION_MAX_LENGTH = 320;
export const PRODUCT_SEO_KEYWORD_MAX_LENGTH = 50;
export const PRODUCT_MAX_SEO_KEYWORDS = 25;

export const PRODUCT_VARIANT_NAME_MAX_LENGTH = 200;
export const PRODUCT_VARIANT_SKU_MAX_LENGTH = 64;

export const PRODUCT_SPECIFICATION_KEY_MAX_LENGTH = 100;
export const PRODUCT_SPECIFICATION_VALUE_MAX_LENGTH = 500;
export const PRODUCT_MAX_SPECIFICATIONS = 100;

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
 * Whether a product appears in public storefront reads (list/search/get
 * by id or slug). Enforced in `service/product.service.ts`, not just
 * documented here: a caller without `product:read` never sees a
 * `PRIVATE` product regardless of what filters it requests.
 */
export const PRODUCT_VISIBILITIES = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

export type ProductVisibility = (typeof PRODUCT_VISIBILITIES)[keyof typeof PRODUCT_VISIBILITIES];

/**
 * Fields the product listing endpoint allows sorting and filtering by,
 * passed as `allowedFields` to `common/`'s `parseSortParams`/
 * `parseFilterParams`.
 */
export const PRODUCT_SORTABLE_FIELDS = ["name", "price", "createdAt", "updatedAt"] as const;
/** `price` is deliberately not filterable through this generic
 * `field[operator]=value` mechanism — a price *range* needs both a
 * lower and upper bound in the same request, and `common/`'s
 * `FilterParams` can only carry one operator per field name (a second
 * `price[...]` key would silently overwrite the first). The list
 * endpoint instead reads dedicated `priceMin`/`priceMax` query params
 * directly — see `controller/product.controller.ts`. */
export const PRODUCT_FILTERABLE_FIELDS = ["categoryId", "status", "visibility", "tags"] as const;

/**
 * Maximum number of ids a single `GET /products/bulk` request may
 * request at once — matches `common/`'s own `PAGINATION_DEFAULTS.MAX_LIMIT`
 * (apps/api/src/common/constants/api.constants.ts), the project's
 * existing convention for "how many rows can one list-shaped request
 * touch." Checked against the raw requested count, before
 * de-duplication, so repeating one id can't be used to dodge the limit.
 */
export const PRODUCT_BULK_LOOKUP_MAX_IDS = 100;
