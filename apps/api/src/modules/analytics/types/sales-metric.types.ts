import type { TimeGranularity } from "../constants";

/** One time-bucketed sales data point. `revenue` (`SUM(Order.total)`
 * for orders in this bucket) was added on top of this foundation's
 * original shape — "total sales"/"sales by day" needs a monetary
 * figure, not just counts. */
export interface SalesMetric {
  period: Date;
  granularity: TimeGranularity;
  orderCount: number;
  unitsSold: number;
  revenue: number;
}
