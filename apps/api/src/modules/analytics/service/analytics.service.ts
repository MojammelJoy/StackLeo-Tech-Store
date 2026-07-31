import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { MetricType } from "../constants";
import type { DashboardSummary } from "../dashboards";
import type { AnalyticsQueryDto } from "../dto";
import type { MetricCalculator, MetricQueryDto, MetricSeries } from "../metrics";
import type { ReportFilterOptions, ReportRequestDto, ReportResult } from "../reports";
import type { AnalyticsRepository } from "../repository";
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
 * Skeleton analytics service — the operations a concrete implementation
 * will expose once real aggregation queries, metric calculators, and
 * report generation exist. Depends on `AnalyticsRepository` (interface
 * only; see `repository/`) for the underlying reads and a *registry* of
 * `MetricCalculator`s keyed by `MetricType` — never a single hardcoded
 * calculation path — mirroring `modules/payment`'s `PaymentProvider`
 * registry pattern; this is what lets `getMetricSeries` support all 8
 * analytics domains uniformly. Every method throws
 * `NotImplementedError` — no database operations, no SQL aggregation,
 * no report generation, and no dashboard assembly happen in this
 * foundation.
 *
 * Every method here is read-only except `requestReport`, which still
 * only *records* a request (see `AnalyticsRepository.createReportRequest`)
 * rather than generating anything. `requestReport` requires
 * `actor: AuthenticatedUser` since report generation is always an
 * attributable admin action; the metric/dashboard reads accept no actor
 * at all, since viewing analytics carries no side effect to attribute.
 * Nothing here checks permissions; that is `modules/rbac`'s job, applied
 * by whatever middleware sits in front of this service once it exists.
 */
export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly metricCalculators: Partial<Record<MetricType, MetricCalculator>>,
  ) {}

  async getSalesMetrics(_dto: MetricQueryDto): Promise<SalesMetric[]> {
    throw new NotImplementedError("AnalyticsService.getSalesMetrics is not implemented yet");
  }

  async getRevenueMetrics(_dto: MetricQueryDto): Promise<RevenueMetric[]> {
    throw new NotImplementedError("AnalyticsService.getRevenueMetrics is not implemented yet");
  }

  async getCustomerMetrics(_dto: MetricQueryDto): Promise<CustomerMetric[]> {
    throw new NotImplementedError("AnalyticsService.getCustomerMetrics is not implemented yet");
  }

  async getProductMetrics(_dto: MetricQueryDto): Promise<ProductMetric[]> {
    throw new NotImplementedError("AnalyticsService.getProductMetrics is not implemented yet");
  }

  async getInventoryMetrics(_dto: MetricQueryDto): Promise<InventoryMetric[]> {
    throw new NotImplementedError("AnalyticsService.getInventoryMetrics is not implemented yet");
  }

  async getOrderMetrics(_dto: MetricQueryDto): Promise<OrderMetric[]> {
    throw new NotImplementedError("AnalyticsService.getOrderMetrics is not implemented yet");
  }

  async getPaymentMetrics(_dto: MetricQueryDto): Promise<PaymentMetric[]> {
    throw new NotImplementedError("AnalyticsService.getPaymentMetrics is not implemented yet");
  }

  async getCouponMetrics(_dto: MetricQueryDto): Promise<CouponMetric[]> {
    throw new NotImplementedError("AnalyticsService.getCouponMetrics is not implemented yet");
  }

  async getMetricSeries(_dto: MetricQueryDto): Promise<MetricSeries> {
    throw new NotImplementedError("AnalyticsService.getMetricSeries is not implemented yet");
  }

  async getDashboardSummary(_dto: AnalyticsQueryDto): Promise<DashboardSummary> {
    throw new NotImplementedError("AnalyticsService.getDashboardSummary is not implemented yet");
  }

  async requestReport(_dto: ReportRequestDto, _actor: AuthenticatedUser): Promise<ReportResult> {
    throw new NotImplementedError("AnalyticsService.requestReport is not implemented yet");
  }

  async getReportStatus(id: string): Promise<ReportResult | null> {
    throw new NotImplementedError(
      `AnalyticsService.getReportStatus is not implemented yet (id: ${id})`,
    );
  }

  async listReports(
    _query: ParsedQuery,
    _filters?: ReportFilterOptions,
  ): Promise<PaginatedResult<ReportResult>> {
    throw new NotImplementedError("AnalyticsService.listReports is not implemented yet");
  }
}
