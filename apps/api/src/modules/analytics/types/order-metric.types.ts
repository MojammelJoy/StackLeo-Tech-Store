import type { TimeGranularity } from "../constants";

export interface OrderMetric {
  period: Date;
  granularity: TimeGranularity;
  orderCount: number;
  averageOrderValue: number;
  cancellationRate: number;
}
