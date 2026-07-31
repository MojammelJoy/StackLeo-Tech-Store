export const REPORT_TYPE_MAX_LENGTH = 100;

/**
 * How many days a single metric/report query is allowed to span. In
 * production, wide-open date ranges translate directly into expensive
 * aggregation queries against real traffic, so the cap is tighter (just
 * over a year, enough for a year-over-year comparison); outside
 * production, a much looser cap avoids getting in the way of seeding
 * and testing with synthetic historical data. See
 * `utils/query-range.util.ts`'s `getMaxQueryRangeDays()`.
 */
export const ANALYTICS_MAX_RANGE_DAYS_PRODUCTION = 366;
export const ANALYTICS_MAX_RANGE_DAYS_DEV = 3650;

/**
 * Fields the (not-yet-built) report-history listing endpoint will allow
 * sorting and filtering by, passed as `allowedFields` to `common/`'s
 * `parseSortParams`/`parseFilterParams`.
 */
export const REPORT_SORTABLE_FIELDS = ["createdAt", "generatedAt"] as const;
export const REPORT_FILTERABLE_FIELDS = ["reportType", "status", "format"] as const;
