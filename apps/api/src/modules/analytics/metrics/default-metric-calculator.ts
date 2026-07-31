import { NotImplementedError } from "../../../errors";

import type { MetricType } from "../constants";
import type { MetricCalculator } from "./metric-calculator.interface";
import type { MetricQuery } from "./metric-query.interface";
import type { MetricSeries } from "./metric-series.interface";

/**
 * `MetricCalculator` implementation — currently a skeleton. Unlike
 * `modules/payment`'s named gateway skeletons (Stripe, SSLCommerz,
 * ...), analytics calculation is an in-house concern with no named
 * third-party product to model, so there is one default, generic
 * implementation — parameterized by which `MetricType` it calculates
 * for — rather than several branded ones. `calculate` throws
 * `NotImplementedError` rather than running any aggregation query; no
 * SQL or Prisma call exists here.
 */
export class DefaultMetricCalculator implements MetricCalculator {
  constructor(readonly metricType: MetricType) {}

  async calculate(query: MetricQuery): Promise<MetricSeries> {
    throw new NotImplementedError(
      `DefaultMetricCalculator.calculate is not implemented yet (metricType: ${query.metricType})`,
    );
  }
}
