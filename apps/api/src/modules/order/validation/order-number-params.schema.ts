import { z } from "zod";

export const orderNumberParamsSchema = z.object({
  orderNumber: z.string().min(1),
});
