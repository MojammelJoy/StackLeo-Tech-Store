import { z } from "zod";

import { METRIC_TYPES, TIME_GRANULARITIES } from "../constants";
import { getMaxQueryRangeDays, isValidQueryRange } from "../utils";

export const metricQuerySchema = z
  .object({
    metricType: z.enum([
      METRIC_TYPES.SALES,
      METRIC_TYPES.REVENUE,
      METRIC_TYPES.PRODUCT,
      METRIC_TYPES.INVENTORY,
      METRIC_TYPES.CUSTOMER,
      METRIC_TYPES.ORDER,
      METRIC_TYPES.PAYMENT,
      METRIC_TYPES.COUPON,
    ]),
    from: z.coerce.date(),
    to: z.coerce.date(),
    granularity: z.enum([
      TIME_GRANULARITIES.HOURLY,
      TIME_GRANULARITIES.DAILY,
      TIME_GRANULARITIES.WEEKLY,
      TIME_GRANULARITIES.MONTHLY,
      TIME_GRANULARITIES.YEARLY,
    ]),
  })
  .refine((data) => isValidQueryRange({ from: data.from, to: data.to }), {
    message: `Date range must have "to" after "from" and span no more than ${getMaxQueryRangeDays()} days`,
    path: ["to"],
  });
