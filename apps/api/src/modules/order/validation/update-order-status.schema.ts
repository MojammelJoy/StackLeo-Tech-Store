import { z } from "zod";

import { ORDER_STATUSES } from "../constants";

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.COMPLETED,
    ORDER_STATUSES.CANCELLED,
    ORDER_STATUSES.REFUNDED,
  ]),
});
