import type { DateRange } from "../interfaces";
import type { MetricSeries } from "../metrics";
import type { KpiValue } from "../types";

/** The "Dashboard summary interfaces" deliverable — what a dashboard
 * view renders: a set of tracked KPIs plus the underlying series for
 * whichever metrics it charts, over one date range. No aggregation
 * happens in this foundation; this only documents the shape a future
 * implementation would assemble. */
export interface DashboardSummary {
  generatedAt: Date;
  range: DateRange;
  kpis: KpiValue[];
  series: MetricSeries[];
}
