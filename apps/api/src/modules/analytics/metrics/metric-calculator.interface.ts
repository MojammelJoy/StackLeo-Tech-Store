import type { MetricType } from "../constants";
import type { MetricQuery } from "./metric-query.interface";
import type { MetricSeries } from "./metric-series.interface";

/**
 * The metric-calculation abstraction every concrete calculator
 * implements. `service/analytics.service.ts` depends on this interface
 * — via a registry keyed by `MetricType` — never on a concrete
 * calculator directly, mirroring `modules/payment`'s `PaymentProvider`
 * registry pattern. No SQL aggregation query lives behind any
 * implementation of this interface in this foundation.
 */
export interface MetricCalculator {
  readonly metricType: MetricType;
  calculate(query: MetricQuery): Promise<MetricSeries>;
}
