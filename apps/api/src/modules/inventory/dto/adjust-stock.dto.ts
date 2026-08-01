import type { adjustStockSchema } from "../validation";
import type { z } from "zod";

export type AdjustStockDto = z.infer<typeof adjustStockSchema>;
