import type { reserveStockSchema } from "../validation";
import type { z } from "zod";

export type ReserveStockDto = z.infer<typeof reserveStockSchema>;
