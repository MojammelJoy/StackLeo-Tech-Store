import type { releaseStockSchema } from "../validation";
import type { z } from "zod";

export type ReleaseStockDto = z.infer<typeof releaseStockSchema>;
