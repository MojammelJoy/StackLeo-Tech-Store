export const BRAND_NAME_MIN_LENGTH = 2;
export const BRAND_NAME_MAX_LENGTH = 100;
export const BRAND_SLUG_MAX_LENGTH = 120;
export const BRAND_DESCRIPTION_MAX_LENGTH = 2000;
export const BRAND_URL_MAX_LENGTH = 2048;
export const BRAND_LOGO_ALT_TEXT_MAX_LENGTH = 200;

export const BRAND_SEO_TITLE_MAX_LENGTH = 70;
export const BRAND_SEO_DESCRIPTION_MAX_LENGTH = 320;
export const BRAND_SEO_KEYWORD_MAX_LENGTH = 50;
export const BRAND_MAX_SEO_KEYWORDS = 25;

/**
 * Character-set check only — lowercase letters, digits, and hyphens.
 * Mirrors `modules/category`'s `CATEGORY_SLUG_PATTERN`: a flat class
 * with one quantifier, rather than a nested-quantifier shape (e.g.
 * `^[a-z0-9]+(?:-[a-z0-9]+)*$`) that trips
 * `security/detect-unsafe-regex`'s catastrophic-backtracking heuristic.
 * The remaining leading/trailing/double-hyphen checks are done with
 * plain string methods in `schemas/brand-slug.schema.ts`.
 */
export const BRAND_SLUG_PATTERN = /^[a-z0-9-]+$/;

/**
 * The brand lifecycle. A generic draft/active/archived flow — no
 * business rules about transitions between them exist anywhere in this
 * codebase yet.
 */
export const BRAND_STATUSES = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type BrandStatus = (typeof BRAND_STATUSES)[keyof typeof BRAND_STATUSES];

/**
 * Whether a brand appears in public storefront reads (list/get by id or
 * slug). Enforced in `service/brand.service.ts`, mirroring
 * `modules/product`'s `PRODUCT_VISIBILITIES`/`modules/category`'s
 * `CATEGORY_VISIBILITIES` exactly.
 */
export const BRAND_VISIBILITIES = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

export type BrandVisibility = (typeof BRAND_VISIBILITIES)[keyof typeof BRAND_VISIBILITIES];

/**
 * Fields the brand listing endpoint allows sorting and filtering by,
 * passed as `allowedFields` to `common/`'s `parseSortParams`/
 * `parseFilterParams`.
 */
export const BRAND_SORTABLE_FIELDS = ["name", "createdAt", "updatedAt"] as const;
export const BRAND_FILTERABLE_FIELDS = ["status", "visibility"] as const;
