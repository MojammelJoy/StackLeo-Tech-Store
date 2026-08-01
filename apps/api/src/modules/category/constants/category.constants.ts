export const CATEGORY_NAME_MIN_LENGTH = 2;
export const CATEGORY_NAME_MAX_LENGTH = 100;
export const CATEGORY_SLUG_MAX_LENGTH = 120;
export const CATEGORY_DESCRIPTION_MAX_LENGTH = 2000;

/**
 * Character-set check only — lowercase letters, digits, and hyphens.
 * Deliberately a single flat character class with one quantifier: any
 * nested-quantifier shape (e.g. `^[a-z0-9]+(?:-[a-z0-9]+)*$`, which
 * would also enforce "no leading/trailing/double hyphen") trips
 * `security/detect-unsafe-regex`'s catastrophic-backtracking heuristic.
 * The remaining leading/trailing/double-hyphen checks are done with
 * plain string methods in `validation/create-category.schema.ts`
 * instead of a more complex regex.
 */
export const CATEGORY_SLUG_PATTERN = /^[a-z0-9-]+$/;

export const CATEGORY_SEO_TITLE_MAX_LENGTH = 70;
export const CATEGORY_SEO_DESCRIPTION_MAX_LENGTH = 320;
export const CATEGORY_SEO_KEYWORD_MAX_LENGTH = 50;
export const CATEGORY_MAX_SEO_KEYWORDS = 25;

/**
 * How many levels deep the tree may go, counting the root as depth 0 —
 * enforced in `service/category.service.ts` on both create (against the
 * chosen `parentId`) and update (against a new `parentId`). Keeps the
 * tree shallow enough to render as breadcrumbs/nav without an
 * unbounded-recursion concern anywhere it's walked.
 */
export const CATEGORY_MAX_DEPTH = 6;

/**
 * The category lifecycle. A generic draft/active/archived flow — no
 * business rules about transitions between them exist anywhere in this
 * codebase yet.
 */
export const CATEGORY_STATUSES = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type CategoryStatus = (typeof CATEGORY_STATUSES)[keyof typeof CATEGORY_STATUSES];

/**
 * Whether a category appears in public storefront reads (list/tree/get
 * by id or slug). Enforced in `service/category.service.ts`, mirroring
 * `modules/product`'s `PRODUCT_VISIBILITIES` exactly.
 */
export const CATEGORY_VISIBILITIES = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

export type CategoryVisibility = (typeof CATEGORY_VISIBILITIES)[keyof typeof CATEGORY_VISIBILITIES];

/**
 * Fields the category listing endpoint allows sorting and filtering by,
 * passed as `allowedFields` to `common/`'s `parseSortParams`/
 * `parseFilterParams`.
 */
export const CATEGORY_SORTABLE_FIELDS = ["name", "sortOrder", "createdAt", "updatedAt"] as const;
export const CATEGORY_FILTERABLE_FIELDS = ["parentId", "status", "visibility"] as const;
