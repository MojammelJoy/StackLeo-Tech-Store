import type { bulkProductQuerySchema } from "../validation";
import type { z } from "zod";

export type BulkProductQueryDto = z.infer<typeof bulkProductQuerySchema>;
