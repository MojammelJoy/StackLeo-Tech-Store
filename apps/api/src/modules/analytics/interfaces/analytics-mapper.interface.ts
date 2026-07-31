import type { DashboardSummary, DashboardSummaryDto } from "../dashboards";
import type { MetricSeries, MetricSeriesResponseDto } from "../metrics";
import type { ReportResponseDto, ReportResult } from "../reports";

/** Contract `mapper/analytics.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation. */
export interface AnalyticsMapper {
  toMetricSeriesDto(series: MetricSeries): MetricSeriesResponseDto;
  toDashboardSummaryDto(summary: DashboardSummary): DashboardSummaryDto;
  toReportResponseDto(result: ReportResult): ReportResponseDto;
}
