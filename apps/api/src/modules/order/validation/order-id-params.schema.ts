import { z } from "zod";

export const orderIdParamsSchema = z.object({
  id: z.string().min(1),
});
