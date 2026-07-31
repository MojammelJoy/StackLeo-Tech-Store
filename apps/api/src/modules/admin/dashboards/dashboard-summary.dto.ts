import type { DashboardSummary } from "./dashboard-summary.types";

/** The "Dashboard DTO" deliverable. Reuses `DashboardSummary` verbatim,
 * the same way `modules/order`'s `OrderSummaryDto` reuses
 * `OrderSummary`: the domain type already *is* the public shape here,
 * with nothing internal to hide. */
export type DashboardSummaryDto = DashboardSummary;
