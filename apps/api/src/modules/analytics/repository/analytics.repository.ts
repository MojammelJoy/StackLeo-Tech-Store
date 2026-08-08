import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { DateRange } from "../interfaces";
import type { MetricQuery } from "../metrics";
import type {
  CouponAnalyticsSummary,
  CouponMetric,
  CouponPerformance,
  CustomerAnalyticsSummary,
  CustomerMetric,
  CustomerPerformance,
  InventoryAdjustmentRanking,
  InventoryAnalyticsSummary,
  InventoryMetric,
  InventoryMovementSummary,
  OrderAnalyticsSummary,
  OrderMetric,
  OrderStatusBreakdown,
  PaymentAnalyticsSummary,
  PaymentMetric,
  ProductCatalogSnapshot,
  ProductMetric,
  ProductPerformance,
  ProductReviewVolume,
  RevenueMetric,
  RevenueSummary,
  SalesMetric,
  SalesSummary,
  CategoryPerformance,
  ReviewAnalyticsSummary,
} from "../types";

/**
 * Read/aggregation contract for every analytics domain this API
 * reports on. The service depends on this interface, never on a
 * concrete implementation directly, so swapping `AnalyticsPrismaRepository`
 * for a test double never touches service code.
 *
 * Two shapes per domain, mirroring how `modules/admin` separated its
 * own rich dashboard from the foundation's generic one: the `get*Metrics`
 * methods (from this foundation's original skeleton) return a bounded,
 * store-wide time series for the generic `/metrics` endpoint; the
 * `get*Summary`/`getTop*`/`getMostAdjusted*` methods are new — a single
 * aggregate snapshot, or a bounded, paginated ranking, for each
 * domain-specific reporting endpoint this API actually exposes.
 * `findReportById`/`findAllReports`/`createReportRequest` (report
 * generation) are this foundation's own out-of-scope skeleton and are
 * deliberately left unimplemented — see `service/analytics.service.ts`'s
 * doc comment.
 */
export interface AnalyticsRepository {
  // ---- Generic time series (foundation's original per-domain contract) ----
  getSalesMetrics(query: MetricQuery): Promise<SalesMetric[]>;
  getRevenueMetrics(query: MetricQuery): Promise<RevenueMetric[]>;
  getCustomerMetrics(query: MetricQuery): Promise<CustomerMetric[]>;
  getProductMetrics(query: MetricQuery): Promise<ProductMetric[]>;
  getInventoryMetrics(query: MetricQuery): Promise<InventoryMetric[]>;
  getOrderMetrics(query: MetricQuery): Promise<OrderMetric[]>;
  getPaymentMetrics(query: MetricQuery): Promise<PaymentMetric[]>;
  getCouponMetrics(query: MetricQuery): Promise<CouponMetric[]>;

  // ---- Sales ----
  getSalesSummary(range: DateRange): Promise<SalesSummary>;

  // ---- Revenue ----
  getRevenueSummary(range: DateRange): Promise<RevenueSummary>;

  // ---- Orders ----
  getOrderSummary(range: DateRange): Promise<OrderAnalyticsSummary>;
  getOrderStatusDistribution(range: DateRange): Promise<OrderStatusBreakdown[]>;

  // ---- Products ----
  getTopProducts(
    range: DateRange,
    query: ParsedQuery,
  ): Promise<PaginatedResult<ProductPerformance>>;
  getProductCatalogSnapshot(): Promise<ProductCatalogSnapshot>;

  // ---- Categories ----
  getCategoryPerformance(
    range: DateRange,
    query: ParsedQuery,
  ): Promise<PaginatedResult<CategoryPerformance>>;

  // ---- Customers ----
  getCustomerSummary(range: DateRange): Promise<CustomerAnalyticsSummary>;
  getTopCustomers(
    range: DateRange,
    query: ParsedQuery,
  ): Promise<PaginatedResult<CustomerPerformance>>;

  // ---- Inventory ----
  getInventorySummary(): Promise<InventoryAnalyticsSummary>;
  getInventoryMovementSummary(range: DateRange): Promise<InventoryMovementSummary>;
  getMostAdjustedInventoryItems(
    range: DateRange,
    query: ParsedQuery,
  ): Promise<PaginatedResult<InventoryAdjustmentRanking>>;

  // ---- Coupons ----
  getCouponSummary(range: DateRange): Promise<CouponAnalyticsSummary>;
  getTopCoupons(range: DateRange, query: ParsedQuery): Promise<PaginatedResult<CouponPerformance>>;

  // ---- Reviews ----
  getReviewSummary(range: DateRange): Promise<ReviewAnalyticsSummary>;
  getTopReviewedProducts(
    range: DateRange,
    query: ParsedQuery,
  ): Promise<PaginatedResult<ProductReviewVolume>>;

  // ---- Payments ----
  getPaymentSummary(range: DateRange): Promise<PaymentAnalyticsSummary>;
}
