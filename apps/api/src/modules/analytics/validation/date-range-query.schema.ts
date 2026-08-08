import { z } from "zod";

import { DATE_RANGE_PRESETS } from "../constants";
import { getMaxQueryRangeDays, isValidQueryRange } from "../utils";

/**
 * The date-range portion of every domain analytics query (sales,
 * revenue, orders, products, categories, customers, inventory, coupons,
 * reviews, payments, dashboard, comparison). A client picks one of two
 * ways to scope the report:
 *   - `preset` — one of `DATE_RANGE_PRESETS` (defaults to `last30days`
 *     when omitted entirely, so every endpoint has a sane bounded range
 *     even with no query params at all).
 *   - `preset=custom` plus explicit `from`/`to` — validated with the
 *     same `isValidQueryRange` bound (`to` after `from`, capped at
 *     `getMaxQueryRangeDays()`) every other analytics date range in this
 *     module already enforces.
 *
 * `.passthrough()` is required: `common/`'s `validateRequest` replaces
 * `req.query` with this schema's parsed result, and every *ranked*
 * endpoint (top products, top customers, ...) also reads `page`/
 * `limit`/`sort` off `req.query` afterward via `common/`'s `parseQuery`
 * — see `modules/search/validation/search-query.schema.ts`'s identical
 * reasoning. Summary-only endpoints don't need the extra keys, but
 * passthrough on an object with none is a no-op.
 */
export const dateRangeQuerySchema = z
  .object({
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
  .passthrough()
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
