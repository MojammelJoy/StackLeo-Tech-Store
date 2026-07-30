export const USER_PASSWORD_MIN_LENGTH = 8;

/**
 * bcrypt (used by `auth/hashPassword`) silently truncates input beyond
 * 72 bytes — rejecting longer passwords here means a submitted password
 * is never quietly weakened by that truncation.
 */
export const USER_PASSWORD_MAX_LENGTH = 72;

/**
 * Fields the (not-yet-built) user listing endpoint will allow sorting
 * and filtering by, passed as `allowedFields` to `common/`'s
 * `parseSortParams`/`parseFilterParams`. Never includes `passwordHash`.
 */
export const USER_SORTABLE_FIELDS = ["email", "createdAt", "updatedAt"] as const;
export const USER_FILTERABLE_FIELDS = ["email", "isActive"] as const;
