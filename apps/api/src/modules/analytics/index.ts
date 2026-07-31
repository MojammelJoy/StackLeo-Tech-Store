/**
 * Reusable analytics infrastructure: per-domain metric types covering
 * all 8 supported analytics areas (sales, revenue, product, inventory,
 * customer, order, payment, coupon — see `types/`), DTOs + Zod
 * validation schemas built from reusable field-level schemas in
 * `schemas/`, the repository contract (plus its currently-skeletal
 * Prisma implementation), a skeleton service, the metric-calculation
 * abstraction with a default skeleton and a future BI-export contract
 * (see `metrics/`), the report-generation contract with a future
 * scheduled-report shape (see `reports/`), decoupled dashboard summary
 * types (see `dashboards/`), the analytics mapper, and the
 * date-range/growth-rate/KPI-trend utilities that support it all. No
 * controllers, routes, business logic, SQL analytics queries, report
 * generation, or dashboard assembly live here — and no sibling module
 * (`modules/product`, `modules/order`, `modules/payment`,
 * `modules/coupon`, etc.) is ever imported, the same cross-module
 * decoupling every foundation in this app follows.
 */
export {
  ANALYTICS_MAX_RANGE_DAYS_DEV,
  ANALYTICS_MAX_RANGE_DAYS_PRODUCTION,
  KPI_TRENDS,
  METRIC_TYPES,
  REPORT_FILTERABLE_FIELDS,
  REPORT_FORMATS,
  REPORT_SORTABLE_FIELDS,
  REPORT_STATUSES,
  REPORT_TYPE_MAX_LENGTH,
  TIME_GRANULARITIES,
} from "./constants";
export type {
  KpiTrend,
  MetricType,
  ReportFormat,
  ReportStatus,
  TimeGranularity,
} from "./constants";

export type {
  CouponMetric,
  CustomerMetric,
  InventoryMetric,
  KpiValue,
  OrderMetric,
  PaymentMetric,
  ProductMetric,
  RevenueMetric,
  SalesMetric,
} from "./types";

export { reportTypeSchema } from "./schemas";

export { analyticsQuerySchema, metricQuerySchema, reportRequestSchema } from "./validation";
export type { AnalyticsQueryDto } from "./dto";

export type { AnalyticsMapper, DateRange } from "./interfaces";

export { DefaultMetricCalculator } from "./metrics";
export type {
  BiExportProvider,
  MetricCalculator,
  MetricDataPoint,
  MetricQuery,
  MetricQueryDto,
  MetricSeries,
  MetricSeriesResponseDto,
} from "./metrics";

export type {
  ReportFilterOptions,
  ReportGenerator,
  ReportRequest,
  ReportRequestDto,
  ReportResponseDto,
  ReportResult,
  ScheduledReport,
} from "./reports";

export type { DashboardSummary, DashboardSummaryDto } from "./dashboards";

export { analyticsMapper } from "./mapper";

export {
  buildDateRange,
  calculateGrowthRate,
  determineTrend,
  getDaysBetween,
  getMaxQueryRangeDays,
  isValidQueryRange,
} from "./utils";

export { AnalyticsPrismaRepository } from "./repository";
export type { AnalyticsRepository } from "./repository";

export { AnalyticsService } from "./service";
