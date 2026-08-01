import { z } from "zod";

export const brandIdParamsSchema = z.object({
  id: z.string().min(1),
});
