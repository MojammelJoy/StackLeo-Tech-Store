import { z } from "zod";

import { PAYMENT_REFUND_REASON_MAX_LENGTH } from "../constants";
import { amountSchema } from "../schemas";

export const refundPaymentSchema = z.object({
  amount: amountSchema,
  reason: z.string().max(PAYMENT_REFUND_REASON_MAX_LENGTH).optional(),
});
