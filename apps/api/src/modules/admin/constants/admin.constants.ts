export const SYSTEM_SETTING_KEY_MAX_LENGTH = 100;
export const SYSTEM_SETTING_VALUE_MAX_LENGTH = 5000;
export const SYSTEM_SETTING_DESCRIPTION_MAX_LENGTH = 500;

/**
 * Fields the (not-yet-built) system-settings listing endpoint will
 * allow sorting and filtering by, passed as `allowedFields` to
 * `common/`'s `parseSortParams`/`parseFilterParams`.
 */
export const ADMIN_SORTABLE_FIELDS = ["key", "createdAt", "updatedAt"] as const;
export const ADMIN_FILTERABLE_FIELDS = ["keyPrefix"] as const;
