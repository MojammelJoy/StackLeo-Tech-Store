export const NOTIFICATION_SUBJECT_MAX_LENGTH = 200;
export const NOTIFICATION_BODY_MAX_LENGTH = 10000;

/** In production, a failed notification is retried a few times before
 * giving up; outside production the default is 0 so local development
 * and automated tests see a failure immediately instead of waiting
 * through a retry sequence. See `utils/retry-policy.util.ts`'s
 * `getDefaultMaxRetries()`. */
export const NOTIFICATION_DEFAULT_MAX_RETRIES_PRODUCTION = 3;
export const NOTIFICATION_DEFAULT_MAX_RETRIES_DEV = 0;
export const NOTIFICATION_DEFAULT_RETRY_INITIAL_DELAY_MS = 60_000;

/**
 * Fields the (not-yet-built) notification listing endpoint will allow
 * sorting and filtering by, passed as `allowedFields` to `common/`'s
 * `parseSortParams`/`parseFilterParams`.
 */
export const NOTIFICATION_SORTABLE_FIELDS = [
  "createdAt",
  "updatedAt",
  "scheduledAt",
  "priority",
] as const;
export const NOTIFICATION_FILTERABLE_FIELDS = ["channel", "type", "priority", "status"] as const;
