import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { AnalyticsController } from "../controller";
import { AnalyticsPrismaRepository } from "../repository";
import { AnalyticsService } from "../service";
import { comparisonQuerySchema, dateRangeQuerySchema, metricQuerySchema } from "../validation";

const analyticsRepository = new AnalyticsPrismaRepository();
const analyticsService = new AnalyticsService(analyticsRepository);
const analyticsController = new AnalyticsController(analyticsService);

/**
 * The full Analytics API surface, mounted at `/api/v1/analytics` (see
 * `routes/v1/index.ts`). Every route requires `authenticate` plus the
 * single `PERMISSIONS.ANALYTICS_READ` permission — see that
 * permission's doc comment in `modules/rbac/constants/permission.constants.ts`
 * for why one permission covers the whole module rather than one per
 * domain. Every route is a `GET`: this module never writes.
 *
 * `dateRangeQuerySchema` (preset or custom `from`/`to`) backs every
 * domain summary/ranking/dashboard endpoint; `comparisonQuerySchema`
 * adds a `domain` selector for `/comparison`; `metricQuerySchema` (the
 * pre-existing foundation schema — `metricType`/`from`/`to`/
 * `granularity`, all required, no preset) backs the generic `/metrics`
 * time series.
 */
export const analyticsRouter: Router = Router();

analyticsRouter.get(
  "/dashboard",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getDashboard,
);

analyticsRouter.get(
  "/metrics",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: metricQuerySchema }),
  analyticsController.getMetricSeries,
);

analyticsRouter.get(
  "/comparison",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: comparisonQuerySchema }),
  analyticsController.comparePeriod,
);

analyticsRouter.get(
  "/sales/summary",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getSalesSummary,
);

analyticsRouter.get(
  "/revenue/summary",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getRevenueSummary,
);

analyticsRouter.get(
  "/orders/summary",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getOrderSummary,
);
analyticsRouter.get(
  "/orders/status-distribution",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getOrderStatusDistribution,
);

analyticsRouter.get(
  "/products/top",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getTopProducts,
);
analyticsRouter.get(
  "/products/catalog-snapshot",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  analyticsController.getProductCatalogSnapshot,
);

analyticsRouter.get(
  "/categories/top",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getCategoryPerformance,
);

analyticsRouter.get(
  "/customers/summary",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getCustomerSummary,
);
analyticsRouter.get(
  "/customers/top",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getTopCustomers,
);

analyticsRouter.get(
  "/inventory/summary",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  analyticsController.getInventorySummary,
);
analyticsRouter.get(
  "/inventory/movements",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getInventoryMovementSummary,
);
analyticsRouter.get(
  "/inventory/most-adjusted",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getMostAdjustedInventoryItems,
);

analyticsRouter.get(
  "/coupons/summary",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getCouponSummary,
);
analyticsRouter.get(
  "/coupons/top",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getTopCoupons,
);

analyticsRouter.get(
  "/reviews/summary",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getReviewSummary,
);
analyticsRouter.get(
  "/reviews/top-products",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getTopReviewedProducts,
);

analyticsRouter.get(
  "/payments/summary",
  authenticate,
  requirePermission(PERMISSIONS.ANALYTICS_READ),
  validateRequest({ query: dateRangeQuerySchema }),
  analyticsController.getPaymentSummary,
);
