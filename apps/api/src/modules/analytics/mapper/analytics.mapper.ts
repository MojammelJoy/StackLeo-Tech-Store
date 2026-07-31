import type { DashboardSummary, DashboardSummaryDto } from "../dashboards";
import type { AnalyticsMapper } from "../interfaces";
import type { MetricSeries, MetricSeriesResponseDto } from "../metrics";
import type { ReportResponseDto, ReportResult } from "../reports";

function toMetricSeriesDto(series: MetricSeries): MetricSeriesResponseDto {
  return series;
}

function toDashboardSummaryDto(summary: DashboardSummary): DashboardSummaryDto {
  return summary;
}

function toReportResponseDto(result: ReportResult): ReportResponseDto {
  return result;
}

/** The only place a `MetricSeries`/`DashboardSummary`/`ReportResult` is
 * converted to its public DTO shape — callers map through this instead
 * of building the DTO by hand, even though each conversion is currently
 * a passthrough (there's nothing internal to hide in any of the three
 * yet). */
export const analyticsMapper: AnalyticsMapper = {
  toMetricSeriesDto,
  toDashboardSummaryDto,
  toReportResponseDto,
};
