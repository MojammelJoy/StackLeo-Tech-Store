import type { analyticsQuerySchema } from "../validation";
import type { z } from "zod";

export type AnalyticsQueryDto = z.infer<typeof analyticsQuerySchema>;
