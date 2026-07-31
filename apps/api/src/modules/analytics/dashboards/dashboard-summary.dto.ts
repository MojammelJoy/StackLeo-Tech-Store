import type { DashboardSummary } from "./dashboard-summary.interface";

/** The "Dashboard DTO" deliverable. Reuses `DashboardSummary` verbatim,
 * the same way `modules/admin`'s `DashboardSummaryDto` reuses its own
 * `DashboardSummary`. */
export type DashboardSummaryDto = DashboardSummary;
