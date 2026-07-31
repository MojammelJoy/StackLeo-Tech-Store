import type { metricQuerySchema } from "../validation";
import type { z } from "zod";

/** The "Metrics DTO" deliverable — a validated request for one
 * `MetricType`'s series. */
export type MetricQueryDto = z.infer<typeof metricQuerySchema>;
