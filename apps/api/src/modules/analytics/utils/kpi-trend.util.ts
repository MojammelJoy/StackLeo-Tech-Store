import { KPI_TRENDS } from "../constants";

import type { KpiTrend } from "../constants";

/** Turns a raw `changePercentage` into the discrete `KpiTrend` a
 * dashboard widget renders (an up/down arrow, or neither). */
export function determineTrend(changePercentage: number): KpiTrend {
  if (changePercentage > 0) {
    return KPI_TRENDS.UP;
  }
  if (changePercentage < 0) {
    return KPI_TRENDS.DOWN;
  }
  return KPI_TRENDS.FLAT;
}
