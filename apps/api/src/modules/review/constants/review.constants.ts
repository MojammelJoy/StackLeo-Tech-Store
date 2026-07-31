export const REVIEW_TITLE_MAX_LENGTH = 150;
export const REVIEW_BODY_MIN_LENGTH = 10;
export const REVIEW_BODY_MAX_LENGTH = 5000;
export const REVIEW_MAX_MEDIA_ITEMS = 10;

/**
 * Fields the (not-yet-built) review listing endpoint will allow sorting
 * and filtering by, passed as `allowedFields` to `common/`'s
 * `parseSortParams`/`parseFilterParams`.
 */
export const REVIEW_SORTABLE_FIELDS = ["createdAt", "updatedAt", "rating", "helpfulCount"] as const;
export const REVIEW_FILTERABLE_FIELDS = ["rating", "moderationStatus", "verifiedOnly"] as const;
