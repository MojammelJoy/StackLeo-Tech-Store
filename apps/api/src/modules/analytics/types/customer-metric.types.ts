import type { TimeGranularity } from "../constants";

export interface CustomerMetric {
  period: Date;
  granularity: TimeGranularity;
  newCustomers: number;
  returningCustomers: number;
  churnRate: number;
}
