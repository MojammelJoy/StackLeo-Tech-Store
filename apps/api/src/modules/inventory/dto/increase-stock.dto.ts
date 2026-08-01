import type { increaseStockSchema } from "../validation";
import type { z } from "zod";

export type IncreaseStockDto = z.infer<typeof increaseStockSchema>;
