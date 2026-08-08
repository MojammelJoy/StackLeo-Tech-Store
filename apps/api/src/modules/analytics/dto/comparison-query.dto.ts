import type { comparisonQuerySchema } from "../validation";
import type { z } from "zod";

/** The validated query shape `GET /analytics/comparison` accepts — see
 * `validation/comparison-query.schema.ts`. */
export type ComparisonQueryDto = z.infer<typeof comparisonQuerySchema>;
