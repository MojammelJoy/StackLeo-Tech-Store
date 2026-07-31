import type { ReportResult } from "./report-result.interface";

/** The public-facing shape of a `ReportResult` — reused verbatim, the
 * same way `metrics/metric-series.dto.ts`'s `MetricSeriesResponseDto`
 * reuses `MetricSeries`. */
export type ReportResponseDto = ReportResult;
