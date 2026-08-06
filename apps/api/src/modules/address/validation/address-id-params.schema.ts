import { z } from "zod";

export const addressIdParamsSchema = z.object({
  id: z.string().min(1),
});
