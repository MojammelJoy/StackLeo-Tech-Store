export const BRAND_NAME_MIN_LENGTH = 2;
export const BRAND_NAME_MAX_LENGTH = 100;
export const BRAND_SLUG_MAX_LENGTH = 120;
export const BRAND_DESCRIPTION_MAX_LENGTH = 2000;
export const BRAND_URL_MAX_LENGTH = 2048;

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
 * Fields the (not-yet-built) brand listing endpoint will allow sorting
 * and filtering by, passed as `allowedFields` to `common/`'s
 * `parseSortParams`/`parseFilterParams`.
 */
export const BRAND_SORTABLE_FIELDS = ["name", "createdAt", "updatedAt"] as const;
export const BRAND_FILTERABLE_FIELDS = ["status"] as const;
