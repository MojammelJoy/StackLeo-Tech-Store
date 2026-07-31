import { z } from "zod";

import { REPORT_FORMATS } from "../constants";
import { reportTypeSchema } from "../schemas";
import { getMaxQueryRangeDays, isValidQueryRange } from "../utils";

export const reportRequestSchema = z
  .object({
    reportType: reportTypeSchema,
    from: z.coerce.date(),
    to: z.coerce.date(),
    format: z.enum([REPORT_FORMATS.CSV, REPORT_FORMATS.JSON, REPORT_FORMATS.PDF]),
  })
  .refine((data) => isValidQueryRange({ from: data.from, to: data.to }), {
    message: `Date range must have "to" after "from" and span no more than ${getMaxQueryRangeDays()} days`,
    path: ["to"],
  });
