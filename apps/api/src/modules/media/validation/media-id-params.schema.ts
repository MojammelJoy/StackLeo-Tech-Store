import { z } from "zod";

export const mediaIdParamsSchema = z.object({
  id: z.string().min(1),
});
