import type { ManagementModuleKey } from "../constants";

/** A single tile a dashboard UI would render, pointing at one
 * management module's summary data. No layout, ordering, or rendering
 * logic lives here — just the shape a future dashboard-configuration
 * feature would persist and read. */
export interface DashboardWidget {
  key: string;
  module: ManagementModuleKey;
  title: string;
}
