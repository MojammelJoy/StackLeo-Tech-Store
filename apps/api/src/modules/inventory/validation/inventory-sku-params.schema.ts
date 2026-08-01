import { z } from "zod";

export const inventorySkuParamsSchema = z.object({
  sku: z.string().min(1),
});
