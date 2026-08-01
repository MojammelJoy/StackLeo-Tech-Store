import type { decreaseStockSchema } from "../validation";
import type { z } from "zod";

export type DecreaseStockDto = z.infer<typeof decreaseStockSchema>;
