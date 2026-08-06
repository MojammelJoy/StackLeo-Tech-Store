import { z } from "zod";

export const transactionIdParamsSchema = z.object({
  transactionId: z.string().min(1),
});
