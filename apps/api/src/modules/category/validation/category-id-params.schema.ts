import { z } from "zod";

export const categoryIdParamsSchema = z.object({
  id: z.string().min(1),
});
