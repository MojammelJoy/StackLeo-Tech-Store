/** `completionRate`/`cancellationRate` are fractions in `[0, 1]`, not
 * percentages — `mapper/`/DTOs decide display formatting, this stays
 * the raw ratio. `averageItemsPerOrder` is `SUM(OrderItem.quantity) /
 * orderCount` — `null` when `orderCount` is `0`, never `NaN`. */
export interface OrderAnalyticsSummary {
  orderCount: number;
  completedCount: number;
  cancelledCount: number;
  completionRate: number;
  cancellationRate: number;
  averageOrderValue: number;
  averageItemsPerOrder: number | null;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
}
