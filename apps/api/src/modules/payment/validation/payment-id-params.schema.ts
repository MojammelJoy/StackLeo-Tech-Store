import { z } from "zod";

export const paymentIdParamsSchema = z.object({
  id: z.string().min(1),
});
