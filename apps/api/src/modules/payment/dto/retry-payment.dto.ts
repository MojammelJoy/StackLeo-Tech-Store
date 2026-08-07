import type { retryPaymentSchema } from "../validation";
import type { z } from "zod";

export type RetryPaymentDto = z.infer<typeof retryPaymentSchema>;
