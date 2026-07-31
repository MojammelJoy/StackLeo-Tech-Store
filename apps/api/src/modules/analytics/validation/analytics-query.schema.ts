import { z } from "zod";

import { TIME_GRANULARITIES } from "../constants";
import { getMaxQueryRangeDays, isValidQueryRange } from "../utils";

/** The generic date-range query behind `getDashboardSummary` — no
 * `metricType`, since a dashboard summary spans every metric type at
 * once. */
export const analyticsQuerySchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
    granularity: z
      .enum([
        TIME_GRANULARITIES.HOURLY,
        TIME_GRANULARITIES.DAILY,
        TIME_GRANULARITIES.WEEKLY,
        TIME_GRANULARITIES.MONTHLY,
        TIME_GRANULARITIES.YEARLY,
      ])
      .optional(),
  })
  .refine((data) => isValidQueryRange({ from: data.from, to: data.to }), {
    message: `Date range must have "to" after "from" and span no more than ${getMaxQueryRangeDays()} days`,
    path: ["to"],
  });
