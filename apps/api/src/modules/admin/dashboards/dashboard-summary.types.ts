import type { ManagementModuleKey } from "../constants";

/** One management module's contribution to the dashboard — e.g. total
 * orders and how many are new since the previous period. A real
 * implementation would compute `totalCount`/`newSinceLastPeriod` by
 * querying each module's own repository; nothing in this foundation
 * does that. */
export interface ModuleMetricSummary {
  module: ManagementModuleKey;
  totalCount: number;
  newSinceLastPeriod: number;
}

export interface DashboardSummary {
  generatedAt: Date;
  metrics: ModuleMetricSummary[];
}
