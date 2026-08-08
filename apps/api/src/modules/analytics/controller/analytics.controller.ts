import { parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { asyncHandler } from "../../../utils";
import {
  CATEGORY_PERFORMANCE_SORTABLE_FIELDS,
  COUPON_PERFORMANCE_SORTABLE_FIELDS,
  CUSTOMER_PERFORMANCE_SORTABLE_FIELDS,
  INVENTORY_ADJUSTMENT_SORTABLE_FIELDS,
  PRODUCT_PERFORMANCE_SORTABLE_FIELDS,
  PRODUCT_REVIEW_VOLUME_SORTABLE_FIELDS,
} from "../constants";

import type { ComparisonQueryDto, DateRangeQueryDto } from "../dto";
import type { MetricQueryDto } from "../metrics";
import type { AnalyticsService } from "../service";

/**
 * Express handlers for the Analytics API. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/analytics.routes.ts` can reference `analyticsController.x`
 * directly) that does only three things: read the request, call one
 * `AnalyticsService` method, and send the response — no aggregation,
 * comparison, or date-range math lives here, mirroring every other
 * module's controller.
 *
 * By the time any of these handlers run, `req.query` has already been
 * replaced with `dateRangeQuerySchema`/`comparisonQuerySchema`/
 * `metricQuerySchema`'s parsed, coerced, `.passthrough()`-preserved
 * output by `validateRequest` (see `routes/analytics.routes.ts`) — the
 * cast to the respective `...Dto` type just gives that already-validated
 * shape a proper static type, the same pattern
 * `modules/search/controller/search.controller.ts` established.
 * `authenticate` + `requirePermission(PERMISSIONS.ANALYTICS_READ)` gate
 * every route, so `req.user` is always present, but nothing here reads
 * it — every endpoint is a store-wide report, never scoped to the
 * caller.
 */
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ---- Dashboard ----

  getDashboard = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const summary = await this.analyticsService.getDashboardSummary(dto, new Date());
    sendSuccess(res, summary);
  });

  // ---- Generic time series ----

  getMetricSeries = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as MetricQueryDto;
    const series = await this.analyticsService.getMetricSeries(dto);
    sendSuccess(res, { series });
  });

  // ---- Sales / Revenue ----

  getSalesSummary = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const summary = await this.analyticsService.getSalesSummary(dto, new Date());
    sendSuccess(res, { summary });
  });

  getRevenueSummary = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const summary = await this.analyticsService.getRevenueSummary(dto, new Date());
    sendSuccess(res, { summary });
  });

  // ---- Orders ----

  getOrderSummary = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const summary = await this.analyticsService.getOrderSummary(dto, new Date());
    sendSuccess(res, { summary });
  });

  getOrderStatusDistribution = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const distribution = await this.analyticsService.getOrderStatusDistribution(dto, new Date());
    sendSuccess(res, { distribution });
  });

  // ---- Products ----

  getTopProducts = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const parsed = parseQuery(req.query, { sortableFields: PRODUCT_PERFORMANCE_SORTABLE_FIELDS });
    const result = await this.analyticsService.getTopProducts(dto, parsed, new Date());
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getProductCatalogSnapshot = asyncHandler(async (_req, res) => {
    const snapshot = await this.analyticsService.getProductCatalogSnapshot();
    sendSuccess(res, { snapshot });
  });

  // ---- Categories ----

  getCategoryPerformance = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const parsed = parseQuery(req.query, { sortableFields: CATEGORY_PERFORMANCE_SORTABLE_FIELDS });
    const result = await this.analyticsService.getCategoryPerformance(dto, parsed, new Date());
    sendPaginatedResponse(res, result.items, result.meta);
  });

  // ---- Customers ----

  getCustomerSummary = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const summary = await this.analyticsService.getCustomerSummary(dto, new Date());
    sendSuccess(res, { summary });
  });

  getTopCustomers = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const parsed = parseQuery(req.query, { sortableFields: CUSTOMER_PERFORMANCE_SORTABLE_FIELDS });
    const result = await this.analyticsService.getTopCustomers(dto, parsed, new Date());
    sendPaginatedResponse(res, result.items, result.meta);
  });

  // ---- Inventory ----

  getInventorySummary = asyncHandler(async (_req, res) => {
    const summary = await this.analyticsService.getInventorySummary();
    sendSuccess(res, { summary });
  });

  getInventoryMovementSummary = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const summary = await this.analyticsService.getInventoryMovementSummary(dto, new Date());
    sendSuccess(res, { summary });
  });

  getMostAdjustedInventoryItems = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const parsed = parseQuery(req.query, { sortableFields: INVENTORY_ADJUSTMENT_SORTABLE_FIELDS });
    const result = await this.analyticsService.getMostAdjustedInventoryItems(
      dto,
      parsed,
      new Date(),
    );
    sendPaginatedResponse(res, result.items, result.meta);
  });

  // ---- Coupons ----

  getCouponSummary = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const summary = await this.analyticsService.getCouponSummary(dto, new Date());
    sendSuccess(res, { summary });
  });

  getTopCoupons = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const parsed = parseQuery(req.query, { sortableFields: COUPON_PERFORMANCE_SORTABLE_FIELDS });
    const result = await this.analyticsService.getTopCoupons(dto, parsed, new Date());
    sendPaginatedResponse(res, result.items, result.meta);
  });

  // ---- Reviews ----

  getReviewSummary = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const summary = await this.analyticsService.getReviewSummary(dto, new Date());
    sendSuccess(res, { summary });
  });

  getTopReviewedProducts = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const parsed = parseQuery(req.query, { sortableFields: PRODUCT_REVIEW_VOLUME_SORTABLE_FIELDS });
    const result = await this.analyticsService.getTopReviewedProducts(dto, parsed, new Date());
    sendPaginatedResponse(res, result.items, result.meta);
  });

  // ---- Payments ----

  getPaymentSummary = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as DateRangeQueryDto;
    const summary = await this.analyticsService.getPaymentSummary(dto, new Date());
    sendSuccess(res, { summary });
  });

  // ---- Comparison ----

  comparePeriod = asyncHandler(async (req, res) => {
    const dto = req.query as unknown as ComparisonQueryDto;
    const result = await this.analyticsService.comparePeriod(dto, new Date());
    sendSuccess(res, result);
  });
}
