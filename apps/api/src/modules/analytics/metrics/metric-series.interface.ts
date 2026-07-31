import type { MetricType, TimeGranularity } from "../constants";

export interface MetricDataPoint {
  period: Date;
  value: number;
}

/** A generic, channel-agnostic time series — what a `MetricCalculator`
 * returns and what a dashboard widget or BI export would consume,
 * regardless of which of the 8 `MetricType`s it represents. */
export interface MetricSeries {
  metricType: MetricType;
  granularity: TimeGranularity;
  points: MetricDataPoint[];
}
