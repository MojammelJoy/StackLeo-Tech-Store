import { calculateGrowthRate } from "../utils";

import type {
  CouponAnalyticsSummary,
  CustomerAnalyticsSummary,
  InventoryMovementSummary,
  OrderAnalyticsSummary,
  PaymentAnalyticsSummary,
  RevenueSummary,
  ReviewAnalyticsSummary,
  SalesSummary,
  ComparisonMetric,
} from "../types";

interface MetricPoint {
  key: string;
  label: string;
  current: number;
  previous: number;
}

/** "Never divide by zero" (`calculateGrowthRate` returns `0` when
 * `previous` is `0`) applied uniformly to every domain's raw
 * current/previous pair. */
function toComparisonMetric(point: MetricPoint): ComparisonMetric {
  return {
    key: point.key,
    label: point.label,
    current: point.current,
    previous: point.previous,
    difference: point.current - point.previous,
    percentageChange: calculateGrowthRate(point.current, point.previous),
  };
}

/**
 * Per-domain field selection for `service/analytics.service.ts`'s
 * `comparePeriod`. Only genuinely period-scoped numeric fields are
 * included — e.g. `CustomerAnalyticsSummary.totalCustomers` and
 * `CouponAnalyticsSummary.totalCoupons`/`activeCoupons` are deliberately
 * left out: both repository methods compute them with no date filter at
 * all (an all-time count), so comparing "current vs previous period"
 * would always show 0% change and mislead rather than inform.
 */
export function buildSalesComparisonMetrics(
  current: SalesSummary,
  previous: SalesSummary,
): ComparisonMetric[] {
  return (
    [
      ["totalSales", "Total Sales"],
      ["orderCount", "Order Count"],
      ["completedSales", "Completed Sales"],
      ["completedOrderCount", "Completed Order Count"],
      ["cancelledOrderCount", "Cancelled Order Count"],
      ["averageOrderValue", "Average Order Value"],
    ] as const
  ).map(([key, label]) =>
    toComparisonMetric({ key, label, current: current[key], previous: previous[key] }),
  );
}

export function buildRevenueComparisonMetrics(
  current: RevenueSummary,
  previous: RevenueSummary,
): ComparisonMetric[] {
  return (
    [
      ["orderTotal", "Order Total"],
      ["paidAmount", "Paid Amount"],
      ["completedSales", "Completed Sales"],
      ["cancelledAmount", "Cancelled Amount"],
      ["cancelledOrderCount", "Cancelled Order Count"],
      ["discountTotal", "Discount Total"],
    ] as const
  ).map(([key, label]) =>
    toComparisonMetric({ key, label, current: current[key], previous: previous[key] }),
  );
}

export function buildOrderComparisonMetrics(
  current: OrderAnalyticsSummary,
  previous: OrderAnalyticsSummary,
): ComparisonMetric[] {
  return (
    [
      ["orderCount", "Order Count"],
      ["completedCount", "Completed Count"],
      ["cancelledCount", "Cancelled Count"],
      ["completionRate", "Completion Rate"],
      ["cancellationRate", "Cancellation Rate"],
      ["averageOrderValue", "Average Order Value"],
    ] as const
  ).map(([key, label]) =>
    toComparisonMetric({ key, label, current: current[key], previous: previous[key] }),
  );
}

export function buildCustomerComparisonMetrics(
  current: CustomerAnalyticsSummary,
  previous: CustomerAnalyticsSummary,
): ComparisonMetric[] {
  return (
    [
      ["newCustomers", "New Customers"],
      ["activeCustomers", "Active Customers"],
    ] as const
  ).map(([key, label]) =>
    toComparisonMetric({ key, label, current: current[key], previous: previous[key] }),
  );
}

export function buildInventoryComparisonMetrics(
  current: InventoryMovementSummary,
  previous: InventoryMovementSummary,
): ComparisonMetric[] {
  return (
    [
      ["totalMovements", "Total Movements"],
      ["stockAdditions", "Stock Additions"],
      ["stockDeductions", "Stock Deductions"],
    ] as const
  ).map(([key, label]) =>
    toComparisonMetric({ key, label, current: current[key], previous: previous[key] }),
  );
}

export function buildCouponComparisonMetrics(
  current: CouponAnalyticsSummary,
  previous: CouponAnalyticsSummary,
): ComparisonMetric[] {
  return (
    [
      ["totalRedemptions", "Total Redemptions"],
      ["totalDiscountGiven", "Total Discount Given"],
    ] as const
  ).map(([key, label]) =>
    toComparisonMetric({ key, label, current: current[key], previous: previous[key] }),
  );
}

export function buildReviewComparisonMetrics(
  current: ReviewAnalyticsSummary,
  previous: ReviewAnalyticsSummary,
): ComparisonMetric[] {
  return (
    [
      ["totalReviews", "Total Reviews"],
      ["approvedReviews", "Approved Reviews"],
      ["pendingReviews", "Pending Reviews"],
      ["rejectedReviews", "Rejected Reviews"],
    ] as const
  ).map(([key, label]) =>
    toComparisonMetric({ key, label, current: current[key], previous: previous[key] }),
  );
}

export function buildPaymentComparisonMetrics(
  current: PaymentAnalyticsSummary,
  previous: PaymentAnalyticsSummary,
): ComparisonMetric[] {
  return (
    [
      ["successfulCount", "Successful Payments"],
      ["failedCount", "Failed Payments"],
      ["pendingCount", "Pending Payments"],
    ] as const
  ).map(([key, label]) =>
    toComparisonMetric({ key, label, current: current[key], previous: previous[key] }),
  );
}
