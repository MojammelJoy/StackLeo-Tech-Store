import type { KpiTrend } from "../constants";

/** A single tracked KPI value — what `dashboards/`'s `DashboardSummary`
 * is a collection of. `changePercentage` and `trend` describe movement
 * relative to the previous period; see `utils/growth-rate.util.ts` and
 * `utils/kpi-trend.util.ts`. */
export interface KpiValue {
  key: string;
  label: string;
  value: number;
  trend: KpiTrend;
  changePercentage: number;
}
