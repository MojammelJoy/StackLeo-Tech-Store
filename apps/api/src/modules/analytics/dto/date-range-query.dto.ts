import type { dateRangeQuerySchema } from "../validation";
import type { z } from "zod";

/** The validated query shape every domain summary/ranking endpoint
 * accepts — see `validation/date-range-query.schema.ts`. */
export type DateRangeQueryDto = z.infer<typeof dateRangeQuerySchema>;
