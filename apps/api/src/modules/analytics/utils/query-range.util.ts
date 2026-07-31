import { config } from "../../../config";
import { ANALYTICS_MAX_RANGE_DAYS_DEV, ANALYTICS_MAX_RANGE_DAYS_PRODUCTION } from "../constants";

import { getDaysBetween } from "./date-range.util";

import type { DateRange } from "../interfaces";

/**
 * How many days a single query is allowed to span in the current
 * environment. Mirrors `modules/notification`'s "numeric default
 * differs by environment" pattern — production is capped tighter to
 * protect real aggregation queries from expensive wide-open ranges;
 * outside production, seeding and testing against synthetic historical
 * data needs much more headroom.
 */
export function getMaxQueryRangeDays(): number {
  return config.isProduction ? ANALYTICS_MAX_RANGE_DAYS_PRODUCTION : ANALYTICS_MAX_RANGE_DAYS_DEV;
}

/** Whether `range` is chronological (`to` after `from`) and within
 * `getMaxQueryRangeDays()` — used by every date-range validation schema
 * in this foundation so the rule is defined in exactly one place. */
export function isValidQueryRange(range: DateRange): boolean {
  return range.to > range.from && getDaysBetween(range) <= getMaxQueryRangeDays();
}
