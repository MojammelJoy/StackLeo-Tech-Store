import type { DashboardOverview } from "../types";

/**
 * The one cross-domain read this module owns outright: no existing
 * module exposes a multi-domain operational summary (each is scoped to
 * its own table), so this is genuinely new capability, not a
 * duplication of one. The service depends on this interface, never on a
 * concrete implementation directly, so swapping
 * `AdminDashboardPrismaRepository` for a test double never touches
 * service code.
 */
export interface AdminDashboardRepository {
  getOverview(): Promise<DashboardOverview>;
}
