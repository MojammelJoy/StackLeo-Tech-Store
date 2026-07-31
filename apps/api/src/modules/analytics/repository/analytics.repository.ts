import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { DashboardSummary } from "../dashboards";
import type { DateRange } from "../interfaces";
import type { MetricQuery } from "../metrics";
import type { ReportFilterOptions, ReportRequest, ReportResult } from "../reports";
import type {
  CouponMetric,
  CustomerMetric,
  InventoryMetric,
  OrderMetric,
  PaymentMetric,
  ProductMetric,
  RevenueMetric,
  SalesMetric,
} from "../types";

/**
 * Read/aggregation contract for every analytics domain this foundation
 * supports, plus report-request bookkeeping. The service depends on
 * this interface, never on a concrete implementation directly, so
 * swapping `AnalyticsPrismaRepository` for a test double (or a
 * different persistence/aggregation layer entirely) never touches
 * service code. Every `get*Metrics` method returns a plain array rather
 * than `PaginatedResult` — a metric series is read in full for its
 * requested range, never paginated; `findAllReports` is the one
 * genuinely paginated listing here, since report history can grow
 * without bound.
 */
export interface AnalyticsRepository {
  getSalesMetrics(query: MetricQuery): Promise<SalesMetric[]>;
  getRevenueMetrics(query: MetricQuery): Promise<RevenueMetric[]>;
  getCustomerMetrics(query: MetricQuery): Promise<CustomerMetric[]>;
  getProductMetrics(query: MetricQuery): Promise<ProductMetric[]>;
  getInventoryMetrics(query: MetricQuery): Promise<InventoryMetric[]>;
  getOrderMetrics(query: MetricQuery): Promise<OrderMetric[]>;
  getPaymentMetrics(query: MetricQuery): Promise<PaymentMetric[]>;
  getCouponMetrics(query: MetricQuery): Promise<CouponMetric[]>;
  getDashboardSummary(range: DateRange): Promise<DashboardSummary>;
  createReportRequest(request: ReportRequest): Promise<ReportResult>;
  findReportById(id: string): Promise<ReportResult | null>;
  findAllReports(
    query: ParsedQuery,
    filters?: ReportFilterOptions,
  ): Promise<PaginatedResult<ReportResult>>;
}
