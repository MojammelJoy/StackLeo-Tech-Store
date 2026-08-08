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

/**
 * Sortable fields for each bounded, paginated ranking endpoint —
 * `common/`'s `parseSortParams` validates the client's `sort` query
 * param against these before it ever reaches
 * `repository/analytics.repository.prisma.ts`'s raw `ORDER BY`, so a
 * caller can never inject an arbitrary column/expression (see that
 * repository's `mapSortFieldToSql` helpers).
 */
export const PRODUCT_PERFORMANCE_SORTABLE_FIELDS = [
  "revenue",
  "unitsSold",
  "orderCount",
  "averageSellingPrice",
  "reviewCount",
  "averageRating",
] as const;
export const CATEGORY_PERFORMANCE_SORTABLE_FIELDS = ["revenue", "unitsSold", "orderCount"] as const;
export const CUSTOMER_PERFORMANCE_SORTABLE_FIELDS = [
  "totalSpent",
  "orderCount",
  "averageOrderValue",
] as const;
export const COUPON_PERFORMANCE_SORTABLE_FIELDS = [
  "redemptionCount",
  "totalDiscountGiven",
] as const;
export const INVENTORY_ADJUSTMENT_SORTABLE_FIELDS = ["movementCount", "totalQuantity"] as const;
export const PRODUCT_REVIEW_VOLUME_SORTABLE_FIELDS = ["reviewCount", "averageRating"] as const;
