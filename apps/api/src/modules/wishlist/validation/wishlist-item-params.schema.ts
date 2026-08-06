import { z } from "zod";

export const wishlistItemParamsSchema = z.object({
  itemId: z.string().min(1),
});
