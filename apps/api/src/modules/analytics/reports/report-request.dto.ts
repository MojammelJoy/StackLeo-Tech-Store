import type { reportRequestSchema } from "../validation";
import type { z } from "zod";

/** The "Report DTO" deliverable — a validated request to generate a
 * report. */
export type ReportRequestDto = z.infer<typeof reportRequestSchema>;
