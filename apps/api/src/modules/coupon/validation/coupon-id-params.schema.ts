import { z } from "zod";

export const couponIdParamsSchema = z.object({
  id: z.string().min(1),
});
