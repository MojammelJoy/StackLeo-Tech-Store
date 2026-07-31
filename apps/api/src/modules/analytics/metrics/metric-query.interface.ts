import type { MetricType, TimeGranularity } from "../constants";

/** A request for one metric type's series over a date range — the
 * input `MetricCalculator.calculate` and
 * `repository/analytics.repository.ts`'s per-domain `get*Metrics`
 * methods take. */
export interface MetricQuery {
  metricType: MetricType;
  from: Date;
  to: Date;
  granularity: TimeGranularity;
}
