import { z } from "zod";

import { ORDER_STATUSES } from "../constants";
import { notesSchema } from "../schemas";

/** `note` becomes the new `OrderStatusHistoryEntry`'s note (e.g. "Stock
 * confirmed, processing shipment") — optional, entirely free-text. */
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.COMPLETED,
    ORDER_STATUSES.CANCELLED,
    ORDER_STATUSES.REFUNDED,
  ]),
  note: notesSchema.optional(),
});
