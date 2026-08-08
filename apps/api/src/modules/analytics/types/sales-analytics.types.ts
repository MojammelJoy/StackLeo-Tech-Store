/** Aggregate sales figures for one date range — the non-time-series
 * half of "sales analytics" (see `types/sales-metric.types.ts`'s
 * `SalesMetric` for the by-period series). `totalSales`/`completedSales`
 * are minor-unit `Order.total` sums, never a separate accounting figure. */
export interface SalesSummary {
  totalSales: number;
  orderCount: number;
  completedSales: number;
  completedOrderCount: number;
  cancelledOrderCount: number;
  averageOrderValue: number;
}
