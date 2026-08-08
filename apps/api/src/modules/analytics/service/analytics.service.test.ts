import { describe, expect, it, vi } from "vitest";

import { DATE_RANGE_PRESETS } from "../constants";

import { AnalyticsService } from "./analytics.service";

import type { PaginatedResult, PaginationMeta, ParsedQuery } from "../../../common";
import type { DateRangeQueryDto } from "../dto";
import type { DateRange } from "../interfaces";
import type { AnalyticsRepository } from "../repository";
import type {
  CouponAnalyticsSummary,
  CustomerAnalyticsSummary,
  InventoryAnalyticsSummary,
  InventoryMovementSummary,
  OrderAnalyticsSummary,
  PaymentAnalyticsSummary,
  ProductCatalogSnapshot,
  RevenueSummary,
  ReviewAnalyticsSummary,
  SalesSummary,
} from "../types";

const NOW = new Date("2026-08-08T12:00:00.000Z");

function buildPaginationMeta(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
  return {
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    ...overrides,
  };
}

function buildPaginatedResult<T>(items: T[] = []): PaginatedResult<T> {
  return { items, meta: buildPaginationMeta({ totalItems: items.length }) };
}

function buildParsedQuery(overrides: Partial<ParsedQuery> = {}): ParsedQuery {
  return {
    pagination: { page: 1, limit: 20 },
    sort: [],
    filters: {},
    ...overrides,
  };
}

function buildSalesSummary(overrides: Partial<SalesSummary> = {}): SalesSummary {
  return {
    totalSales: 0,
    orderCount: 0,
    completedSales: 0,
    completedOrderCount: 0,
    cancelledOrderCount: 0,
    averageOrderValue: 0,
    ...overrides,
  };
}

function buildRevenueSummary(overrides: Partial<RevenueSummary> = {}): RevenueSummary {
  return {
    orderTotal: 0,
    paidAmount: 0,
    completedSales: 0,
    cancelledAmount: 0,
    cancelledOrderCount: 0,
    discountTotal: 0,
    ...overrides,
  };
}

function buildOrderSummary(overrides: Partial<OrderAnalyticsSummary> = {}): OrderAnalyticsSummary {
  return {
    orderCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    completionRate: 0,
    cancellationRate: 0,
    averageOrderValue: 0,
    averageItemsPerOrder: null,
    ...overrides,
  };
}

function buildCustomerSummary(
  overrides: Partial<CustomerAnalyticsSummary> = {},
): CustomerAnalyticsSummary {
  return { totalCustomers: 0, newCustomers: 0, activeCustomers: 0, ...overrides };
}

function buildInventorySummary(
  overrides: Partial<InventoryAnalyticsSummary> = {},
): InventoryAnalyticsSummary {
  return { totalItems: 0, lowStockCount: 0, outOfStockCount: 0, ...overrides };
}

function buildInventoryMovementSummary(
  overrides: Partial<InventoryMovementSummary> = {},
): InventoryMovementSummary {
  return { totalMovements: 0, stockAdditions: 0, stockDeductions: 0, byType: [], ...overrides };
}

function buildCouponSummary(
  overrides: Partial<CouponAnalyticsSummary> = {},
): CouponAnalyticsSummary {
  return {
    totalCoupons: 0,
    activeCoupons: 0,
    inactiveCoupons: 0,
    totalRedemptions: 0,
    totalDiscountGiven: 0,
    ...overrides,
  };
}

function buildReviewSummary(
  overrides: Partial<ReviewAnalyticsSummary> = {},
): ReviewAnalyticsSummary {
  return {
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    rejectedReviews: 0,
    flaggedReviews: 0,
    averageRating: null,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    ...overrides,
  };
}

function buildPaymentSummary(
  overrides: Partial<PaymentAnalyticsSummary> = {},
): PaymentAnalyticsSummary {
  return {
    statusDistribution: [],
    methodDistribution: [],
    providerDistribution: [],
    successfulCount: 0,
    failedCount: 0,
    pendingCount: 0,
    ...overrides,
  };
}

function buildProductCatalogSnapshot(
  overrides: Partial<ProductCatalogSnapshot> = {},
): ProductCatalogSnapshot {
  return { totalProducts: 0, activeProducts: 0, ...overrides };
}

function buildRepository(overrides: Partial<AnalyticsRepository> = {}): AnalyticsRepository {
  return {
    getSalesMetrics: vi.fn().mockResolvedValue([]),
    getRevenueMetrics: vi.fn().mockResolvedValue([]),
    getCustomerMetrics: vi.fn().mockResolvedValue([]),
    getProductMetrics: vi.fn().mockResolvedValue([]),
    getInventoryMetrics: vi.fn().mockResolvedValue([]),
    getOrderMetrics: vi.fn().mockResolvedValue([]),
    getPaymentMetrics: vi.fn().mockResolvedValue([]),
    getCouponMetrics: vi.fn().mockResolvedValue([]),

    getSalesSummary: vi.fn().mockResolvedValue(buildSalesSummary()),
    getRevenueSummary: vi.fn().mockResolvedValue(buildRevenueSummary()),
    getOrderSummary: vi.fn().mockResolvedValue(buildOrderSummary()),
    getOrderStatusDistribution: vi.fn().mockResolvedValue([]),
    getTopProducts: vi.fn().mockResolvedValue(buildPaginatedResult([])),
    getProductCatalogSnapshot: vi.fn().mockResolvedValue(buildProductCatalogSnapshot()),
    getCategoryPerformance: vi.fn().mockResolvedValue(buildPaginatedResult([])),
    getCustomerSummary: vi.fn().mockResolvedValue(buildCustomerSummary()),
    getTopCustomers: vi.fn().mockResolvedValue(buildPaginatedResult([])),
    getInventorySummary: vi.fn().mockResolvedValue(buildInventorySummary()),
    getInventoryMovementSummary: vi.fn().mockResolvedValue(buildInventoryMovementSummary()),
    getMostAdjustedInventoryItems: vi.fn().mockResolvedValue(buildPaginatedResult([])),
    getCouponSummary: vi.fn().mockResolvedValue(buildCouponSummary()),
    getTopCoupons: vi.fn().mockResolvedValue(buildPaginatedResult([])),
    getReviewSummary: vi.fn().mockResolvedValue(buildReviewSummary()),
    getTopReviewedProducts: vi.fn().mockResolvedValue(buildPaginatedResult([])),
    getPaymentSummary: vi.fn().mockResolvedValue(buildPaymentSummary()),
    ...overrides,
  };
}

function buildService(overrides: Partial<AnalyticsRepository> = {}): {
  service: AnalyticsService;
  repository: AnalyticsRepository;
} {
  const repository = buildRepository(overrides);
  return { service: new AnalyticsService(repository), repository };
}

function customRangeDto(from: Date, to: Date): DateRangeQueryDto {
  return { preset: DATE_RANGE_PRESETS.CUSTOM, from, to };
}

function presetDto(preset: Exclude<DateRangeQueryDto["preset"], "custom">): DateRangeQueryDto {
  return { preset };
}

describe("AnalyticsService", () => {
  describe("date-range resolution", () => {
    it("resolves a custom preset using the request's own from/to", async () => {
      const from = new Date("2026-07-01T00:00:00.000Z");
      const to = new Date("2026-07-08T00:00:00.000Z");
      const { service, repository } = buildService();

      await service.getSalesSummary(customRangeDto(from, to), NOW);

      expect(repository.getSalesSummary).toHaveBeenCalledWith({ from, to });
    });

    it("resolves the last7days preset to a 7-day window ending at 'now'", async () => {
      const { service, repository } = buildService();

      await service.getSalesSummary(presetDto(DATE_RANGE_PRESETS.LAST_7_DAYS), NOW);

      const range = (repository.getSalesSummary as ReturnType<typeof vi.fn>).mock
        .calls[0][0] as DateRange;
      expect(range.to.toISOString()).toBe("2026-08-09T00:00:00.000Z");
      expect(range.from.toISOString()).toBe("2026-08-02T00:00:00.000Z");
    });

    it("resolves the today preset to the current UTC day only", async () => {
      const { service, repository } = buildService();

      await service.getSalesSummary(presetDto(DATE_RANGE_PRESETS.TODAY), NOW);

      const range = (repository.getSalesSummary as ReturnType<typeof vi.fn>).mock
        .calls[0][0] as DateRange;
      expect(range.from.toISOString()).toBe("2026-08-08T00:00:00.000Z");
      expect(range.to.toISOString()).toBe("2026-08-09T00:00:00.000Z");
    });

    it("resolves currentMonth to the first day of the month through the first day of next month", async () => {
      const { service, repository } = buildService();

      await service.getSalesSummary(presetDto(DATE_RANGE_PRESETS.CURRENT_MONTH), NOW);

      const range = (repository.getSalesSummary as ReturnType<typeof vi.fn>).mock
        .calls[0][0] as DateRange;
      expect(range.from.toISOString()).toBe("2026-08-01T00:00:00.000Z");
      expect(range.to.toISOString()).toBe("2026-09-01T00:00:00.000Z");
    });
  });

  describe("domain summaries", () => {
    it("passes the resolved range through to the sales summary repository call", async () => {
      const summary = buildSalesSummary({ totalSales: 10_000, orderCount: 5 });
      const { service } = buildService({ getSalesSummary: vi.fn().mockResolvedValue(summary) });

      const result = await service.getSalesSummary(presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS), NOW);
      expect(result).toEqual(summary);
    });

    it("returns the revenue summary from the repository unchanged", async () => {
      const summary = buildRevenueSummary({ orderTotal: 5000, paidAmount: 4000 });
      const { service } = buildService({ getRevenueSummary: vi.fn().mockResolvedValue(summary) });

      const result = await service.getRevenueSummary(
        presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS),
        NOW,
      );
      expect(result).toEqual(summary);
    });

    it("returns order status distribution from the repository unchanged", async () => {
      const distribution = [{ status: "completed", count: 4 }];
      const { service } = buildService({
        getOrderStatusDistribution: vi.fn().mockResolvedValue(distribution),
      });

      const result = await service.getOrderStatusDistribution(
        presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS),
        NOW,
      );
      expect(result).toEqual(distribution);
    });

    it("returns an empty order status distribution safely when there is no data", async () => {
      const { service } = buildService();
      const result = await service.getOrderStatusDistribution(
        presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS),
        NOW,
      );
      expect(result).toEqual([]);
    });

    it("passes pagination/sort query through unchanged to getTopProducts", async () => {
      const query = buildParsedQuery({ sort: [{ field: "revenue", order: "desc" }] });
      const { service, repository } = buildService();

      await service.getTopProducts(presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS), query, NOW);
      expect(repository.getTopProducts).toHaveBeenCalledWith(expect.anything(), query);
    });

    it("passes pagination/sort query through unchanged to getCategoryPerformance", async () => {
      const query = buildParsedQuery({ pagination: { page: 2, limit: 10 } });
      const { service, repository } = buildService();

      await service.getCategoryPerformance(presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS), query, NOW);
      expect(repository.getCategoryPerformance).toHaveBeenCalledWith(expect.anything(), query);
    });

    it("passes pagination/sort query through unchanged to getTopCustomers", async () => {
      const query = buildParsedQuery();
      const { service, repository } = buildService();

      await service.getTopCustomers(presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS), query, NOW);
      expect(repository.getTopCustomers).toHaveBeenCalledWith(expect.anything(), query);
    });

    it("returns the product catalog snapshot with no date range involved", async () => {
      const snapshot = buildProductCatalogSnapshot({ totalProducts: 40, activeProducts: 35 });
      const { service, repository } = buildService({
        getProductCatalogSnapshot: vi.fn().mockResolvedValue(snapshot),
      });

      const result = await service.getProductCatalogSnapshot();
      expect(result).toEqual(snapshot);
      expect(repository.getProductCatalogSnapshot).toHaveBeenCalledWith();
    });

    it("returns the customer summary from the repository unchanged", async () => {
      const summary = buildCustomerSummary({ totalCustomers: 100, newCustomers: 10 });
      const { service } = buildService({ getCustomerSummary: vi.fn().mockResolvedValue(summary) });

      const result = await service.getCustomerSummary(
        presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS),
        NOW,
      );
      expect(result).toEqual(summary);
    });

    it("returns the inventory summary with no date range involved", async () => {
      const summary = buildInventorySummary({ totalItems: 200, lowStockCount: 5 });
      const { service, repository } = buildService({
        getInventorySummary: vi.fn().mockResolvedValue(summary),
      });

      const result = await service.getInventorySummary();
      expect(result).toEqual(summary);
      expect(repository.getInventorySummary).toHaveBeenCalledWith();
    });

    it("returns the inventory movement summary from the repository unchanged", async () => {
      const summary = buildInventoryMovementSummary({ stockAdditions: 20, stockDeductions: 5 });
      const { service } = buildService({
        getInventoryMovementSummary: vi.fn().mockResolvedValue(summary),
      });

      const result = await service.getInventoryMovementSummary(
        presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS),
        NOW,
      );
      expect(result).toEqual(summary);
    });

    it("passes pagination/sort query through unchanged to getMostAdjustedInventoryItems", async () => {
      const query = buildParsedQuery();
      const { service, repository } = buildService();

      await service.getMostAdjustedInventoryItems(
        presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS),
        query,
        NOW,
      );
      expect(repository.getMostAdjustedInventoryItems).toHaveBeenCalledWith(
        expect.anything(),
        query,
      );
    });

    it("returns the coupon summary from the repository unchanged", async () => {
      const summary = buildCouponSummary({ totalRedemptions: 12 });
      const { service } = buildService({ getCouponSummary: vi.fn().mockResolvedValue(summary) });

      const result = await service.getCouponSummary(
        presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS),
        NOW,
      );
      expect(result).toEqual(summary);
    });

    it("passes pagination/sort query through unchanged to getTopCoupons", async () => {
      const query = buildParsedQuery();
      const { service, repository } = buildService();

      await service.getTopCoupons(presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS), query, NOW);
      expect(repository.getTopCoupons).toHaveBeenCalledWith(expect.anything(), query);
    });

    it("returns the review summary from the repository unchanged", async () => {
      const summary = buildReviewSummary({ totalReviews: 8, approvedReviews: 6 });
      const { service } = buildService({ getReviewSummary: vi.fn().mockResolvedValue(summary) });

      const result = await service.getReviewSummary(
        presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS),
        NOW,
      );
      expect(result).toEqual(summary);
    });

    it("passes pagination/sort query through unchanged to getTopReviewedProducts", async () => {
      const query = buildParsedQuery();
      const { service, repository } = buildService();

      await service.getTopReviewedProducts(presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS), query, NOW);
      expect(repository.getTopReviewedProducts).toHaveBeenCalledWith(expect.anything(), query);
    });

    it("returns the payment summary from the repository unchanged", async () => {
      const summary = buildPaymentSummary({ successfulCount: 9, failedCount: 1 });
      const { service } = buildService({ getPaymentSummary: vi.fn().mockResolvedValue(summary) });

      const result = await service.getPaymentSummary(
        presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS),
        NOW,
      );
      expect(result).toEqual(summary);
    });
  });

  describe("getMetricSeries", () => {
    it("maps sales metrics to a {period, value} series using revenue", async () => {
      const { service } = buildService({
        getSalesMetrics: vi
          .fn()
          .mockResolvedValue([
            {
              period: new Date("2026-08-01"),
              granularity: "daily",
              orderCount: 2,
              unitsSold: 3,
              revenue: 500,
            },
          ]),
      });

      const series = await service.getMetricSeries({
        metricType: "sales",
        from: new Date("2026-08-01"),
        to: new Date("2026-08-02"),
        granularity: "daily",
      });

      expect(series.points).toEqual([{ period: new Date("2026-08-01"), value: 500 }]);
    });

    it("maps inventory metrics to net stock change (additions minus deductions)", async () => {
      const { service } = buildService({
        getInventoryMetrics: vi
          .fn()
          .mockResolvedValue([
            {
              period: new Date("2026-08-01"),
              granularity: "daily",
              stockAdditions: 30,
              stockDeductions: 12,
            },
          ]),
      });

      const series = await service.getMetricSeries({
        metricType: "inventory",
        from: new Date("2026-08-01"),
        to: new Date("2026-08-02"),
        granularity: "daily",
      });

      expect(series.points).toEqual([{ period: new Date("2026-08-01"), value: 18 }]);
    });

    it("returns an empty series safely when there is no data for the range", async () => {
      const { service } = buildService();
      const series = await service.getMetricSeries({
        metricType: "order",
        from: new Date("2026-08-01"),
        to: new Date("2026-08-02"),
        granularity: "daily",
      });
      expect(series.points).toEqual([]);
    });
  });

  describe("getDashboardSummary", () => {
    it("computes an up trend when the current period beats the previous period", async () => {
      const { service } = buildService({
        getSalesSummary: vi
          .fn()
          .mockResolvedValueOnce(buildSalesSummary({ totalSales: 20_000, orderCount: 10 }))
          .mockResolvedValueOnce(buildSalesSummary({ totalSales: 10_000, orderCount: 5 })),
      });

      const summary = await service.getDashboardSummary(
        presetDto(DATE_RANGE_PRESETS.LAST_7_DAYS),
        NOW,
      );

      const grossKpi = summary.kpis.find((kpi) => kpi.key === "grossOrderAmount");
      expect(grossKpi?.value).toBe(20_000);
      expect(grossKpi?.trend).toBe("up");
      expect(grossKpi?.changePercentage).toBe(100);
    });

    it("never divides by zero when the previous period had no sales", async () => {
      const { service } = buildService({
        getSalesSummary: vi
          .fn()
          .mockResolvedValueOnce(buildSalesSummary({ totalSales: 5000, orderCount: 2 }))
          .mockResolvedValueOnce(buildSalesSummary({ totalSales: 0, orderCount: 0 })),
      });

      const summary = await service.getDashboardSummary(
        presetDto(DATE_RANGE_PRESETS.LAST_7_DAYS),
        NOW,
      );
      const grossKpi = summary.kpis.find((kpi) => kpi.key === "grossOrderAmount");

      expect(grossKpi?.changePercentage).toBe(0);
      expect(Number.isFinite(grossKpi?.changePercentage)).toBe(true);
    });

    it("marks point-in-time KPIs (no previous period) as flat with 0% change", async () => {
      const { service } = buildService({
        getProductCatalogSnapshot: vi
          .fn()
          .mockResolvedValue(
            buildProductCatalogSnapshot({ totalProducts: 50, activeProducts: 45 }),
          ),
      });

      const summary = await service.getDashboardSummary(
        presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS),
        NOW,
      );
      const totalProductsKpi = summary.kpis.find((kpi) => kpi.key === "totalProducts");

      expect(totalProductsKpi?.value).toBe(50);
      expect(totalProductsKpi?.trend).toBe("flat");
      expect(totalProductsKpi?.changePercentage).toBe(0);
    });

    it("returns an empty series (KPI snapshot, not a chart)", async () => {
      const { service } = buildService();
      const summary = await service.getDashboardSummary(
        presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS),
        NOW,
      );
      expect(summary.series).toEqual([]);
      expect(summary.generatedAt).toEqual(NOW);
    });

    it("handles a fully empty dataset without throwing", async () => {
      const { service } = buildService();
      await expect(
        service.getDashboardSummary(presetDto(DATE_RANGE_PRESETS.LAST_30_DAYS), NOW),
      ).resolves.toBeDefined();
    });
  });

  describe("comparePeriod", () => {
    it("computes previous-period comparison metrics for the sales domain", async () => {
      const { service } = buildService({
        getSalesSummary: vi
          .fn()
          .mockResolvedValueOnce(buildSalesSummary({ totalSales: 15_000, orderCount: 6 }))
          .mockResolvedValueOnce(buildSalesSummary({ totalSales: 10_000, orderCount: 4 })),
      });

      const result = await service.comparePeriod(
        { preset: DATE_RANGE_PRESETS.LAST_7_DAYS, domain: "sales" },
        NOW,
      );

      const totalSalesMetric = result.metrics.find((metric) => metric.key === "totalSales");
      expect(totalSalesMetric?.current).toBe(15_000);
      expect(totalSalesMetric?.previous).toBe(10_000);
      expect(totalSalesMetric?.difference).toBe(5000);
      expect(totalSalesMetric?.percentageChange).toBe(50);
    });

    it("never divides by zero when the previous period is zero for any comparison domain", async () => {
      const { service } = buildService({
        getReviewSummary: vi
          .fn()
          .mockResolvedValueOnce(buildReviewSummary({ totalReviews: 3 }))
          .mockResolvedValueOnce(buildReviewSummary({ totalReviews: 0 })),
      });

      const result = await service.comparePeriod(
        { preset: DATE_RANGE_PRESETS.LAST_7_DAYS, domain: "review" },
        NOW,
      );

      const metric = result.metrics.find((m) => m.key === "totalReviews");
      expect(metric?.percentageChange).toBe(0);
      expect(metric?.difference).toBe(3);
    });

    it("computes the previous range as the immediately preceding period of equal length", async () => {
      const { service, repository } = buildService();

      const result = await service.comparePeriod(
        {
          preset: DATE_RANGE_PRESETS.CUSTOM,
          from: new Date("2026-08-01T00:00:00.000Z"),
          to: new Date("2026-08-08T00:00:00.000Z"),
          domain: "order",
        },
        NOW,
      );

      expect(result.currentRange).toEqual({
        from: new Date("2026-08-01T00:00:00.000Z"),
        to: new Date("2026-08-08T00:00:00.000Z"),
      });
      expect(result.previousRange).toEqual({
        from: new Date("2026-07-25T00:00:00.000Z"),
        to: new Date("2026-08-01T00:00:00.000Z"),
      });
      expect(repository.getOrderSummary).toHaveBeenCalledTimes(2);
    });

    it("compares the coupon domain using only its period-scoped fields", async () => {
      const { service } = buildService({
        getCouponSummary: vi
          .fn()
          .mockResolvedValueOnce(
            buildCouponSummary({ totalRedemptions: 8, totalDiscountGiven: 4000 }),
          )
          .mockResolvedValueOnce(
            buildCouponSummary({ totalRedemptions: 4, totalDiscountGiven: 2000 }),
          ),
      });

      const result = await service.comparePeriod(
        { preset: DATE_RANGE_PRESETS.LAST_30_DAYS, domain: "coupon" },
        NOW,
      );

      expect(result.metrics.map((metric) => metric.key)).toEqual([
        "totalRedemptions",
        "totalDiscountGiven",
      ]);
    });

    it("compares the payment domain using only its count fields", async () => {
      const { service } = buildService({
        getPaymentSummary: vi
          .fn()
          .mockResolvedValueOnce(buildPaymentSummary({ successfulCount: 10, failedCount: 1 }))
          .mockResolvedValueOnce(buildPaymentSummary({ successfulCount: 8, failedCount: 2 })),
      });

      const result = await service.comparePeriod(
        { preset: DATE_RANGE_PRESETS.LAST_30_DAYS, domain: "payment" },
        NOW,
      );

      expect(result.metrics.map((metric) => metric.key)).toEqual([
        "successfulCount",
        "failedCount",
        "pendingCount",
      ]);
    });

    it("compares the inventory domain using movement summary figures", async () => {
      const { service, repository } = buildService({
        getInventoryMovementSummary: vi
          .fn()
          .mockResolvedValueOnce(buildInventoryMovementSummary({ stockAdditions: 40 }))
          .mockResolvedValueOnce(buildInventoryMovementSummary({ stockAdditions: 20 })),
      });

      await service.comparePeriod(
        { preset: DATE_RANGE_PRESETS.LAST_30_DAYS, domain: "inventory" },
        NOW,
      );
      expect(repository.getInventoryMovementSummary).toHaveBeenCalledTimes(2);
    });

    it("compares the customer domain excluding the all-time totalCustomers field", async () => {
      const { service } = buildService({
        getCustomerSummary: vi
          .fn()
          .mockResolvedValueOnce(buildCustomerSummary({ newCustomers: 5, activeCustomers: 3 }))
          .mockResolvedValueOnce(buildCustomerSummary({ newCustomers: 2, activeCustomers: 1 })),
      });

      const result = await service.comparePeriod(
        { preset: DATE_RANGE_PRESETS.LAST_30_DAYS, domain: "customer" },
        NOW,
      );

      expect(result.metrics.map((metric) => metric.key)).toEqual([
        "newCustomers",
        "activeCustomers",
      ]);
    });

    it("compares the revenue domain distinguishing order/paid/completed/cancelled figures", async () => {
      const { service } = buildService({
        getRevenueSummary: vi
          .fn()
          .mockResolvedValueOnce(buildRevenueSummary({ orderTotal: 9000, paidAmount: 8000 }))
          .mockResolvedValueOnce(buildRevenueSummary({ orderTotal: 6000, paidAmount: 5000 })),
      });

      const result = await service.comparePeriod(
        { preset: DATE_RANGE_PRESETS.LAST_30_DAYS, domain: "revenue" },
        NOW,
      );

      const orderTotalMetric = result.metrics.find((metric) => metric.key === "orderTotal");
      expect(orderTotalMetric?.current).toBe(9000);
      expect(orderTotalMetric?.previous).toBe(6000);
    });
  });

  describe("report generation (out of scope)", () => {
    it("rejects report requests — the Analytics API is read-only reporting only", async () => {
      const { service } = buildService();
      await expect(service.requestReport({} as never, { id: "user-1" } as never)).rejects.toThrow(
        /not supported/i,
      );
    });
  });
});
