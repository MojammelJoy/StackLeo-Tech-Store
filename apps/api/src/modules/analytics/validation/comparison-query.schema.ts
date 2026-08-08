import { z } from "zod";

import { COMPARISON_DOMAINS, DATE_RANGE_PRESETS } from "../constants";
import { getMaxQueryRangeDays, isValidQueryRange } from "../utils";

/** The same date-range shape as `dateRangeQuerySchema`, plus which
 * domain to compare — see `constants/comparison-domain.constants.ts`
 * for why only these 8 domains are eligible. Duplicated rather than
 * composed via `z.intersection`/`.and()` with `dateRangeQuerySchema`:
 * intersecting two independently-refined object schemas loses the
 * clean flat inferred type every other analytics DTO has. */
export const comparisonQuerySchema = z
  .object({
    domain: z.enum([
      COMPARISON_DOMAINS.SALES,
      COMPARISON_DOMAINS.REVENUE,
      COMPARISON_DOMAINS.ORDER,
      COMPARISON_DOMAINS.CUSTOMER,
      COMPARISON_DOMAINS.INVENTORY,
      COMPARISON_DOMAINS.COUPON,
      COMPARISON_DOMAINS.REVIEW,
      COMPARISON_DOMAINS.PAYMENT,
    ]),
    preset: z
      .enum([
        DATE_RANGE_PRESETS.TODAY,
        DATE_RANGE_PRESETS.YESTERDAY,
        DATE_RANGE_PRESETS.LAST_7_DAYS,
        DATE_RANGE_PRESETS.LAST_30_DAYS,
        DATE_RANGE_PRESETS.CURRENT_MONTH,
        DATE_RANGE_PRESETS.PREVIOUS_MONTH,
        DATE_RANGE_PRESETS.CURRENT_YEAR,
        DATE_RANGE_PRESETS.CUSTOM,
      ])
      .default(DATE_RANGE_PRESETS.LAST_30_DAYS),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((data) => data.preset !== DATE_RANGE_PRESETS.CUSTOM || (data.from && data.to), {
    message: '"from" and "to" are required when preset is "custom"',
    path: ["from"],
  })
  .refine(
    (data) => {
      if (data.preset !== DATE_RANGE_PRESETS.CUSTOM || !data.from || !data.to) {
        return true;
      }
      return isValidQueryRange({ from: data.from, to: data.to });
    },
    {
      message: `Date range must have "to" after "from" and span no more than ${getMaxQueryRangeDays()} days`,
      path: ["to"],
    },
  );
