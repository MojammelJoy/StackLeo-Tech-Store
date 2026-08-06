import { z } from "zod";

import { notesSchema } from "../schemas";

/** `note` becomes the cancelling `OrderStatusHistoryEntry`'s note (e.g.
 * "Changed my mind", "Ordered by mistake") — entirely optional, since a
 * plain cancellation needs no explanation. */
export const cancelOrderSchema = z.object({
  note: notesSchema.optional(),
});
