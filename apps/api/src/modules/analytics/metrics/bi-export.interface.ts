import type { MetricSeries } from "./metric-series.interface";

/**
 * What a future BI-tool integration (a data warehouse sync, an
 * analytics-platform export, etc.) would implement to receive metric
 * series from this app. No concrete implementation exists — unlike
 * `modules/notification`'s named provider skeletons, no specific BI
 * product is named in this foundation's requirements, so only the
 * shape such an integration would satisfy is documented here.
 */
export interface BiExportProvider {
  readonly name: string;
  export(series: MetricSeries[]): Promise<void>;
}
