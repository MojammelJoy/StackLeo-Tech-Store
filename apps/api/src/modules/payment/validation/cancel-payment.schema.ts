import { z } from "zod";

import { PAYMENT_REFUND_REASON_MAX_LENGTH } from "../constants";

export const cancelPaymentSchema = z.object({
  reason: z.string().max(PAYMENT_REFUND_REASON_MAX_LENGTH).optional(),
});
