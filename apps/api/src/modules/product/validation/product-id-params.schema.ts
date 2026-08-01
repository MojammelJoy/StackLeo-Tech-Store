import { z } from "zod";

export const productIdParamsSchema = z.object({
  id: z.string().min(1),
});
