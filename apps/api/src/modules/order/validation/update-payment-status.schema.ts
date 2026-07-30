import { z } from "zod";

import { PAYMENT_STATUSES } from "../constants";

export const updatePaymentStatusSchema = z.object({
  status: z.enum([
    PAYMENT_STATUSES.PENDING,
    PAYMENT_STATUSES.AUTHORIZED,
    PAYMENT_STATUSES.PAID,
    PAYMENT_STATUSES.FAILED,
    PAYMENT_STATUSES.PARTIALLY_REFUNDED,
    PAYMENT_STATUSES.REFUNDED,
  ]),
});
