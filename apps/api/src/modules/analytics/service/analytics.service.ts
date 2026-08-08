import { BadRequestError } from "../../../errors";
import { DATE_RANGE_PRESETS, METRIC_TYPES } from "../constants";
import {
  buildDateRange,
  calculateGrowthRate,
  determineTrend,
  getPreviousPeriodRange,
  resolveDateRangePreset,
} from "../utils";

import {
  buildCouponComparisonMetrics,
  buildCustomerComparisonMetrics,
  buildInventoryComparisonMetrics,
  buildOrderComparisonMetrics,
  buildPaymentComparisonMetrics,
  buildReviewComparisonMetrics,
  buildRevenueComparisonMetrics,
  buildSalesComparisonMetrics,
} from "./comparison-metrics.util";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { ComparisonDomain } from "../constants";
import type { DashboardSummary } from "../dashboards";
import type { ComparisonQueryDto, DateRangeQueryDto } from "../dto";
import type { DateRange } from "../interfaces";
import type { MetricQueryDto, MetricSeries } from "../metrics";
import type { ReportFilterOptions, ReportRequestDto, ReportResult } from "../reports";
import type { AnalyticsRepository } from "../repository";
import type {
  CategoryPerformance,
  ComparisonResult,
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
  KpiValue,
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
  ReviewAnalyticsSummary,
  SalesMetric,
  SalesSummary,
} from "../types";

/**
 * Analytics orchestration layer: resolves date-range presets, derives
 * previous-period ranges for comparison, and composes repository reads
 * into the response shapes this module's endpoints return. Every actual
 * database read lives in `AnalyticsRepository` (interface only — see
 * `repository/`); nothing here issues SQL. Permissions are enforced
 * entirely by `modules/rbac`'s `requirePermission` middleware in front
 * of `routes/analytics.routes.ts` — this service never checks a role or
 * permission itself.
 *
 * `requestReport`/`getReportStatus`/`listReports` (report generation)
 * are this foundation's own out-of-scope skeleton and stay
 * unimplemented — the Analytics API task this module was built for is
 * read-only reporting, not scheduled report generation/export.
 */
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  // =========================================================================
  // Date-range resolution
  // =========================================================================

  /** `dateRangeQuerySchema`'s `.refine()` already guarantees `from`/`to`
   * are both present whenever `preset === "custom"` — the `as Date`
   * casts here reflect that already-validated invariant, not an
   * unchecked assumption. */
  private resolveRange(dto: DateRangeQueryDto, now: Date): DateRange {
    if (dto.preset === DATE_RANGE_PRESETS.CUSTOM) {
      return buildDateRange(dto.from as Date, dto.to as Date);
    }
    return resolveDateRangePreset(dto.preset, now);
  }

  // =========================================================================
  // Generic time series (one per `MetricType`)
  // =========================================================================

  async getSalesMetrics(dto: MetricQueryDto): Promise<SalesMetric[]> {
    return this.analyticsRepository.getSalesMetrics(dto);
  }

  async getRevenueMetrics(dto: MetricQueryDto): Promise<RevenueMetric[]> {
    return this.analyticsRepository.getRevenueMetrics(dto);
  }

  async getCustomerMetrics(dto: MetricQueryDto): Promise<CustomerMetric[]> {
    return this.analyticsRepository.getCustomerMetrics(dto);
  }

  async getProductMetrics(dto: MetricQueryDto): Promise<ProductMetric[]> {
    return this.analyticsRepository.getProductMetrics(dto);
  }

  async getInventoryMetrics(dto: MetricQueryDto): Promise<InventoryMetric[]> {
    return this.analyticsRepository.getInventoryMetrics(dto);
  }

  async getOrderMetrics(dto: MetricQueryDto): Promise<OrderMetric[]> {
    return this.analyticsRepository.getOrderMetrics(dto);
  }

  async getPaymentMetrics(dto: MetricQueryDto): Promise<PaymentMetric[]> {
    return this.analyticsRepository.getPaymentMetrics(dto);
  }

  async getCouponMetrics(dto: MetricQueryDto): Promise<CouponMetric[]> {
    return this.analyticsRepository.getCouponMetrics(dto);
  }

  /** Reduces each domain's own multi-field metric row to the one
   * numeric figure most representative of that domain, so every
   * `MetricType` can share this one generic `{period, value}` series
   * shape (e.g. a dashboard chart widget). Callers who need a metric's
   * *other* fields (e.g. `SalesMetric.orderCount` alongside `revenue`)
   * should call that domain's own `get*Metrics` directly instead. */
  async getMetricSeries(dto: MetricQueryDto): Promise<MetricSeries> {
    switch (dto.metricType) {
      case METRIC_TYPES.SALES: {
        const rows = await this.analyticsRepository.getSalesMetrics(dto);
        return {
          metricType: dto.metricType,
          granularity: dto.granularity,
          points: rows.map((row) => ({ period: row.period, value: row.revenue })),
        };
      }
      case METRIC_TYPES.REVENUE: {
        const rows = await this.analyticsRepository.getRevenueMetrics(dto);
        return {
          metricType: dto.metricType,
          granularity: dto.granularity,
          points: rows.map((row) => ({ period: row.period, value: row.grossRevenue })),
        };
      }
      case METRIC_TYPES.PRODUCT: {
        const rows = await this.analyticsRepository.getProductMetrics(dto);
        return {
          metricType: dto.metricType,
          granularity: dto.granularity,
          points: rows.map((row) => ({ period: row.period, value: row.revenue })),
        };
      }
      case METRIC_TYPES.INVENTORY: {
        const rows = await this.analyticsRepository.getInventoryMetrics(dto);
        return {
          metricType: dto.metricType,
          granularity: dto.granularity,
          points: rows.map((row) => ({
            period: row.period,
            value: row.stockAdditions - row.stockDeductions,
          })),
        };
      }
      case METRIC_TYPES.CUSTOMER: {
        const rows = await this.analyticsRepository.getCustomerMetrics(dto);
        return {
          metricType: dto.metricType,
          granularity: dto.granularity,
          points: rows.map((row) => ({ period: row.period, value: row.newCustomers })),
        };
      }
      case METRIC_TYPES.ORDER: {
        const rows = await this.analyticsRepository.getOrderMetrics(dto);
        return {
          metricType: dto.metricType,
          granularity: dto.granularity,
          points: rows.map((row) => ({ period: row.period, value: row.orderCount })),
        };
      }
      case METRIC_TYPES.PAYMENT: {
        const rows = await this.analyticsRepository.getPaymentMetrics(dto);
        return {
          metricType: dto.metricType,
          granularity: dto.granularity,
          points: rows.map((row) => ({ period: row.period, value: row.totalProcessed })),
        };
      }
      case METRIC_TYPES.COUPON: {
        const rows = await this.analyticsRepository.getCouponMetrics(dto);
        return {
          metricType: dto.metricType,
          granularity: dto.granularity,
          points: rows.map((row) => ({ period: row.period, value: row.redemptionCount })),
        };
      }
      default:
        throw new BadRequestError(`Unsupported metric type: ${String(dto.metricType)}`);
    }
  }

  // =========================================================================
  // Sales / Revenue
  // =========================================================================

  async getSalesSummary(dto: DateRangeQueryDto, now: Date): Promise<SalesSummary> {
    return this.analyticsRepository.getSalesSummary(this.resolveRange(dto, now));
  }

  async getRevenueSummary(dto: DateRangeQueryDto, now: Date): Promise<RevenueSummary> {
    return this.analyticsRepository.getRevenueSummary(this.resolveRange(dto, now));
  }

  // =========================================================================
  // Orders
  // =========================================================================

  async getOrderSummary(dto: DateRangeQueryDto, now: Date): Promise<OrderAnalyticsSummary> {
    return this.analyticsRepository.getOrderSummary(this.resolveRange(dto, now));
  }

  async getOrderStatusDistribution(
    dto: DateRangeQueryDto,
    now: Date,
  ): Promise<OrderStatusBreakdown[]> {
    return this.analyticsRepository.getOrderStatusDistribution(this.resolveRange(dto, now));
  }

  // =========================================================================
  // Products
  // =========================================================================

  async getTopProducts(
    dto: DateRangeQueryDto,
    query: ParsedQuery,
    now: Date,
  ): Promise<PaginatedResult<ProductPerformance>> {
    return this.analyticsRepository.getTopProducts(this.resolveRange(dto, now), query);
  }

  async getProductCatalogSnapshot(): Promise<ProductCatalogSnapshot> {
    return this.analyticsRepository.getProductCatalogSnapshot();
  }

  // =========================================================================
  // Categories
  // =========================================================================

  async getCategoryPerformance(
    dto: DateRangeQueryDto,
    query: ParsedQuery,
    now: Date,
  ): Promise<PaginatedResult<CategoryPerformance>> {
    return this.analyticsRepository.getCategoryPerformance(this.resolveRange(dto, now), query);
  }

  // =========================================================================
  // Customers
  // =========================================================================

  async getCustomerSummary(dto: DateRangeQueryDto, now: Date): Promise<CustomerAnalyticsSummary> {
    return this.analyticsRepository.getCustomerSummary(this.resolveRange(dto, now));
  }

  async getTopCustomers(
    dto: DateRangeQueryDto,
    query: ParsedQuery,
    now: Date,
  ): Promise<PaginatedResult<CustomerPerformance>> {
    return this.analyticsRepository.getTopCustomers(this.resolveRange(dto, now), query);
  }

  // =========================================================================
  // Inventory
  // =========================================================================

  async getInventorySummary(): Promise<InventoryAnalyticsSummary> {
    return this.analyticsRepository.getInventorySummary();
  }

  async getInventoryMovementSummary(
    dto: DateRangeQueryDto,
    now: Date,
  ): Promise<InventoryMovementSummary> {
    return this.analyticsRepository.getInventoryMovementSummary(this.resolveRange(dto, now));
  }

  async getMostAdjustedInventoryItems(
    dto: DateRangeQueryDto,
    query: ParsedQuery,
    now: Date,
  ): Promise<PaginatedResult<InventoryAdjustmentRanking>> {
    return this.analyticsRepository.getMostAdjustedInventoryItems(
      this.resolveRange(dto, now),
      query,
    );
  }

  // =========================================================================
  // Coupons
  // =========================================================================

  async getCouponSummary(dto: DateRangeQueryDto, now: Date): Promise<CouponAnalyticsSummary> {
    return this.analyticsRepository.getCouponSummary(this.resolveRange(dto, now));
  }

  async getTopCoupons(
    dto: DateRangeQueryDto,
    query: ParsedQuery,
    now: Date,
  ): Promise<PaginatedResult<CouponPerformance>> {
    return this.analyticsRepository.getTopCoupons(this.resolveRange(dto, now), query);
  }

  // =========================================================================
  // Reviews
  // =========================================================================

  async getReviewSummary(dto: DateRangeQueryDto, now: Date): Promise<ReviewAnalyticsSummary> {
    return this.analyticsRepository.getReviewSummary(this.resolveRange(dto, now));
  }

  async getTopReviewedProducts(
    dto: DateRangeQueryDto,
    query: ParsedQuery,
    now: Date,
  ): Promise<PaginatedResult<ProductReviewVolume>> {
    return this.analyticsRepository.getTopReviewedProducts(this.resolveRange(dto, now), query);
  }

  // =========================================================================
  // Payments
  // =========================================================================

  async getPaymentSummary(dto: DateRangeQueryDto, now: Date): Promise<PaymentAnalyticsSummary> {
    return this.analyticsRepository.getPaymentSummary(this.resolveRange(dto, now));
  }

  // =========================================================================
  // Dashboard overview
  // =========================================================================

  /**
   * The single operational-dashboard snapshot: gross/completed order
   * amount, order count, completed/cancelled order count, average order
   * value, total/new customers, total/active products, low-stock
   * products, review count, approved review count, coupon redemptions —
   * every KPI the Analytics API task's "Dashboard analytics" section
   * lists, each backed by a real aggregate read. Point-in-time figures
   * (`totalCustomers`, `totalProducts`, `activeProducts`,
   * `lowStockProducts`) carry a `flat`/`0%` trend since there is no
   * meaningful "previous period" for an all-time count; every other KPI
   * compares against the immediately preceding period of equal length
   * (see `utils/date-range.util.ts`'s `getPreviousPeriodRange`).
   *
   * `series` is intentionally empty — this is a KPI snapshot, not a
   * chart; a caller wanting a time series uses `getMetricSeries`
   * directly instead of this endpoint duplicating it.
   */
  async getDashboardSummary(dto: DateRangeQueryDto, now: Date): Promise<DashboardSummary> {
    const range = this.resolveRange(dto, now);
    const previousRange = getPreviousPeriodRange(range);

    const [
      sales,
      previousSales,
      order,
      previousOrder,
      customer,
      previousCustomer,
      catalog,
      inventory,
      review,
      coupon,
    ] = await Promise.all([
      this.analyticsRepository.getSalesSummary(range),
      this.analyticsRepository.getSalesSummary(previousRange),
      this.analyticsRepository.getOrderSummary(range),
      this.analyticsRepository.getOrderSummary(previousRange),
      this.analyticsRepository.getCustomerSummary(range),
      this.analyticsRepository.getCustomerSummary(previousRange),
      this.analyticsRepository.getProductCatalogSnapshot(),
      this.analyticsRepository.getInventorySummary(),
      this.analyticsRepository.getReviewSummary(range),
      this.analyticsRepository.getCouponSummary(range),
    ]);

    const trending = (key: string, label: string, current: number, previous: number): KpiValue => {
      const changePercentage = calculateGrowthRate(current, previous);
      return {
        key,
        label,
        value: current,
        trend: determineTrend(changePercentage),
        changePercentage,
      };
    };
    const flat = (key: string, label: string, value: number): KpiValue => ({
      key,
      label,
      value,
      trend: "flat",
      changePercentage: 0,
    });

    const kpis: KpiValue[] = [
      trending(
        "grossOrderAmount",
        "Gross Order Amount",
        sales.totalSales,
        previousSales.totalSales,
      ),
      trending(
        "completedOrderAmount",
        "Completed Order Amount",
        sales.completedSales,
        previousSales.completedSales,
      ),
      trending("orderCount", "Order Count", sales.orderCount, previousSales.orderCount),
      trending(
        "completedOrderCount",
        "Completed Order Count",
        order.completedCount,
        previousOrder.completedCount,
      ),
      trending(
        "cancelledOrderCount",
        "Cancelled Order Count",
        order.cancelledCount,
        previousOrder.cancelledCount,
      ),
      trending(
        "averageOrderValue",
        "Average Order Value",
        sales.averageOrderValue,
        previousSales.averageOrderValue,
      ),
      flat("totalCustomers", "Total Customers", customer.totalCustomers),
      trending(
        "newCustomers",
        "New Customers",
        customer.newCustomers,
        previousCustomer.newCustomers,
      ),
      flat("totalProducts", "Total Products", catalog.totalProducts),
      flat("activeProducts", "Active Products", catalog.activeProducts),
      flat("lowStockProducts", "Low-Stock Products", inventory.lowStockCount),
      flat("reviewCount", "Review Count", review.totalReviews),
      flat("approvedReviewCount", "Approved Review Count", review.approvedReviews),
      flat("couponRedemptions", "Coupon Redemptions", coupon.totalRedemptions),
    ];

    return { generatedAt: now, range, kpis, series: [] };
  }

  // =========================================================================
  // Comparison
  // =========================================================================

  /** Current-vs-previous-period comparison for one of
   * `COMPARISON_DOMAINS` — see `service/comparison-metrics.util.ts` for
   * why only these 8 domains (and only their genuinely period-scoped
   * fields) are eligible. */
  async comparePeriod(dto: ComparisonQueryDto, now: Date): Promise<ComparisonResult> {
    const currentRange = this.resolveRange(dto, now);
    const previousRange = getPreviousPeriodRange(currentRange);
    const domain = dto.domain as ComparisonDomain;

    switch (domain) {
      case "sales": {
        const [current, previous] = await Promise.all([
          this.analyticsRepository.getSalesSummary(currentRange),
          this.analyticsRepository.getSalesSummary(previousRange),
        ]);
        return {
          currentRange,
          previousRange,
          metrics: buildSalesComparisonMetrics(current, previous),
        };
      }
      case "revenue": {
        const [current, previous] = await Promise.all([
          this.analyticsRepository.getRevenueSummary(currentRange),
          this.analyticsRepository.getRevenueSummary(previousRange),
        ]);
        return {
          currentRange,
          previousRange,
          metrics: buildRevenueComparisonMetrics(current, previous),
        };
      }
      case "order": {
        const [current, previous] = await Promise.all([
          this.analyticsRepository.getOrderSummary(currentRange),
          this.analyticsRepository.getOrderSummary(previousRange),
        ]);
        return {
          currentRange,
          previousRange,
          metrics: buildOrderComparisonMetrics(current, previous),
        };
      }
      case "customer": {
        const [current, previous] = await Promise.all([
          this.analyticsRepository.getCustomerSummary(currentRange),
          this.analyticsRepository.getCustomerSummary(previousRange),
        ]);
        return {
          currentRange,
          previousRange,
          metrics: buildCustomerComparisonMetrics(current, previous),
        };
      }
      case "inventory": {
        const [current, previous] = await Promise.all([
          this.analyticsRepository.getInventoryMovementSummary(currentRange),
          this.analyticsRepository.getInventoryMovementSummary(previousRange),
        ]);
        return {
          currentRange,
          previousRange,
          metrics: buildInventoryComparisonMetrics(current, previous),
        };
      }
      case "coupon": {
        const [current, previous] = await Promise.all([
          this.analyticsRepository.getCouponSummary(currentRange),
          this.analyticsRepository.getCouponSummary(previousRange),
        ]);
        return {
          currentRange,
          previousRange,
          metrics: buildCouponComparisonMetrics(current, previous),
        };
      }
      case "review": {
        const [current, previous] = await Promise.all([
          this.analyticsRepository.getReviewSummary(currentRange),
          this.analyticsRepository.getReviewSummary(previousRange),
        ]);
        return {
          currentRange,
          previousRange,
          metrics: buildReviewComparisonMetrics(current, previous),
        };
      }
      case "payment": {
        const [current, previous] = await Promise.all([
          this.analyticsRepository.getPaymentSummary(currentRange),
          this.analyticsRepository.getPaymentSummary(previousRange),
        ]);
        return {
          currentRange,
          previousRange,
          metrics: buildPaymentComparisonMetrics(current, previous),
        };
      }
      default:
        throw new BadRequestError(`Unsupported comparison domain: ${String(domain)}`);
    }
  }

  // =========================================================================
  // Report generation — out of scope, left unimplemented (see class doc)
  // =========================================================================

  async requestReport(_dto: ReportRequestDto, _actor: AuthenticatedUser): Promise<ReportResult> {
    throw new BadRequestError("Report generation is not supported by the Analytics API");
  }

  async getReportStatus(id: string): Promise<ReportResult | null> {
    throw new BadRequestError(
      `Report generation is not supported by the Analytics API (id: ${id})`,
    );
  }

  async listReports(
    _query: ParsedQuery,
    _filters?: ReportFilterOptions,
  ): Promise<PaginatedResult<ReportResult>> {
    throw new BadRequestError("Report generation is not supported by the Analytics API");
  }
}
