import type { verifyPaymentSchema } from "../validation";
import type { z } from "zod";

export type VerifyPaymentDto = z.infer<typeof verifyPaymentSchema>;
