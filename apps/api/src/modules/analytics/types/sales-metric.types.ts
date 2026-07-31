import type { TimeGranularity } from "../constants";

/** One time-bucketed sales data point. */
export interface SalesMetric {
  period: Date;
  granularity: TimeGranularity;
  orderCount: number;
  unitsSold: number;
}
