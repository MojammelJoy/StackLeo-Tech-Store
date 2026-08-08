import type { DashboardOverview } from "../types";

/** The "admin dashboard overview" deliverable. Reuses `DashboardOverview`
 * verbatim — the same way `modules/coupon`'s `RatingSummaryResponseDto`
 * reuses `ReviewSummary` — since it's already the public shape with
 * nothing internal to hide. */
export type DashboardOverviewResponseDto = DashboardOverview;
