import { z } from "zod";

export const verifyPaymentSchema = z.object({
  providerRef: z.string().min(1),
});
