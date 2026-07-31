import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

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
import type { AnalyticsRepository } from "./analytics.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `AnalyticsRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * running a query: no analytics-specific model exists in
 * `prisma/schema.prisma`, and the real aggregation each `get*Metrics`
 * method would need reads from every other module's own tables (none of
 * which this module imports or queries directly). Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection) so only the method bodies are left to fill in once the
 * underlying aggregation exists.
 */
export class AnalyticsPrismaRepository implements AnalyticsRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async getSalesMetrics(query: MetricQuery): Promise<SalesMetric[]> {
    throw new NotImplementedError(
      `AnalyticsPrismaRepository.getSalesMetrics is not implemented yet (metricType: ${query.metricType})`,
    );
  }

  async getRevenueMetrics(query: MetricQuery): Promise<RevenueMetric[]> {
    throw new NotImplementedError(
      `AnalyticsPrismaRepository.getRevenueMetrics is not implemented yet (metricType: ${query.metricType})`,
    );
  }

  async getCustomerMetrics(query: MetricQuery): Promise<CustomerMetric[]> {
    throw new NotImplementedError(
      `AnalyticsPrismaRepository.getCustomerMetrics is not implemented yet (metricType: ${query.metricType})`,
    );
  }

  async getProductMetrics(query: MetricQuery): Promise<ProductMetric[]> {
    throw new NotImplementedError(
      `AnalyticsPrismaRepository.getProductMetrics is not implemented yet (metricType: ${query.metricType})`,
    );
  }

  async getInventoryMetrics(query: MetricQuery): Promise<InventoryMetric[]> {
    throw new NotImplementedError(
      `AnalyticsPrismaRepository.getInventoryMetrics is not implemented yet (metricType: ${query.metricType})`,
    );
  }

  async getOrderMetrics(query: MetricQuery): Promise<OrderMetric[]> {
    throw new NotImplementedError(
      `AnalyticsPrismaRepository.getOrderMetrics is not implemented yet (metricType: ${query.metricType})`,
    );
  }

  async getPaymentMetrics(query: MetricQuery): Promise<PaymentMetric[]> {
    throw new NotImplementedError(
      `AnalyticsPrismaRepository.getPaymentMetrics is not implemented yet (metricType: ${query.metricType})`,
    );
  }

  async getCouponMetrics(query: MetricQuery): Promise<CouponMetric[]> {
    throw new NotImplementedError(
      `AnalyticsPrismaRepository.getCouponMetrics is not implemented yet (metricType: ${query.metricType})`,
    );
  }

  async getDashboardSummary(_range: DateRange): Promise<DashboardSummary> {
    throw new NotImplementedError(
      "AnalyticsPrismaRepository.getDashboardSummary is not implemented yet",
    );
  }

  async createReportRequest(request: ReportRequest): Promise<ReportResult> {
    throw new NotImplementedError(
      `AnalyticsPrismaRepository.createReportRequest is not implemented yet (reportType: ${request.reportType})`,
    );
  }

  async findReportById(id: string): Promise<ReportResult | null> {
    throw new NotImplementedError(
      `AnalyticsPrismaRepository.findReportById is not implemented yet (id: ${id})`,
    );
  }

  async findAllReports(
    _query: ParsedQuery,
    _filters?: ReportFilterOptions,
  ): Promise<PaginatedResult<ReportResult>> {
    throw new NotImplementedError(
      "AnalyticsPrismaRepository.findAllReports is not implemented yet",
    );
  }
}
