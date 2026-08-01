import { z } from "zod";

export const inventoryIdParamsSchema = z.object({
  id: z.string().min(1),
});
