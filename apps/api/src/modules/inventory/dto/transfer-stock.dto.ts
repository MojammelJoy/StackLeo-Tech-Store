import type { transferStockSchema } from "../validation";
import type { z } from "zod";

export type TransferStockDto = z.infer<typeof transferStockSchema>;
