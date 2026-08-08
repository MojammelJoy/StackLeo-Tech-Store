/**
 * Domains `service/analytics.service.ts`'s `comparePeriod` can compare
 * current-vs-previous-period. Deliberately narrower than
 * `METRIC_TYPES`/the full set of domain summaries: only domains with a
 * `get*Summary(range)` repository method whose fields are genuinely
 * period-scoped (never a point-in-time count like
 * `getProductCatalogSnapshot`/`getInventorySummary`'s `totalProducts`/
 * `totalItems`, which would always compare equal-vs-equal and mean
 * nothing) are eligible — see `service/comparison-metrics.util.ts`.
 * `product`/`category` are excluded entirely: neither has a
 * `range`-scoped *summary*, only a bounded, paginated ranking.
 */
export const COMPARISON_DOMAINS = {
  SALES: "sales",
  REVENUE: "revenue",
  ORDER: "order",
  CUSTOMER: "customer",
  INVENTORY: "inventory",
  COUPON: "coupon",
  REVIEW: "review",
  PAYMENT: "payment",
} as const;

export type ComparisonDomain = (typeof COMPARISON_DOMAINS)[keyof typeof COMPARISON_DOMAINS];
