import { z } from "zod";

export const cartItemParamsSchema = z.object({
  itemId: z.string().min(1),
});
