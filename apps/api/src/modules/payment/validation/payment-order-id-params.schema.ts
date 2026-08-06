import { z } from "zod";

export const paymentOrderIdParamsSchema = z.object({
  orderId: z.string().min(1),
});
