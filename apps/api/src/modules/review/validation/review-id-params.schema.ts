import { z } from "zod";

export const reviewIdParamsSchema = z.object({
  id: z.string().min(1),
});
