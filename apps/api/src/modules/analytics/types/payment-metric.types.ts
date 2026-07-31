import type { TimeGranularity } from "../constants";

export interface PaymentMetric {
  period: Date;
  granularity: TimeGranularity;
  successRate: number;
  refundRate: number;
  totalProcessed: number;
}
