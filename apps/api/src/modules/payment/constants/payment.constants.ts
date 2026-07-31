export const PAYMENT_REFERENCE_SEQUENCE_PAD_LENGTH = 8;
export const PAYMENT_MIN_AMOUNT = 1;
export const PAYMENT_REFUND_REASON_MAX_LENGTH = 500;

/**
 * Fields the (not-yet-built) payment listing endpoint will allow sorting
 * and filtering by, passed as `allowedFields` to `common/`'s
 * `parseSortParams`/`parseFilterParams`.
 */
export const PAYMENT_SORTABLE_FIELDS = ["createdAt", "updatedAt", "amount"] as const;
export const PAYMENT_FILTERABLE_FIELDS = ["status", "method", "provider", "currency"] as const;
