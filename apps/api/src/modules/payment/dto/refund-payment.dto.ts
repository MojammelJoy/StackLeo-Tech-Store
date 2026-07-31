import type { refundPaymentSchema } from "../validation";
import type { z } from "zod";

export type RefundPaymentDto = z.infer<typeof refundPaymentSchema>;
