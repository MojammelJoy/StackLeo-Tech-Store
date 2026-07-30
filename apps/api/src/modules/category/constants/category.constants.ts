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
 * Fields the (not-yet-built) category listing endpoint will allow
 * sorting and filtering by, passed as `allowedFields` to `common/`'s
 * `parseSortParams`/`parseFilterParams`.
 */
export const CATEGORY_SORTABLE_FIELDS = ["name", "createdAt", "updatedAt"] as const;
export const CATEGORY_FILTERABLE_FIELDS = ["parentId", "status"] as const;
