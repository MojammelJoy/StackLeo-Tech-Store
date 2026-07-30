import { z } from "zod";

import { FULFILLMENT_STATUSES } from "../constants";

export const updateFulfillmentStatusSchema = z.object({
  status: z.enum([
    FULFILLMENT_STATUSES.UNFULFILLED,
    FULFILLMENT_STATUSES.PROCESSING,
    FULFILLMENT_STATUSES.SHIPPED,
    FULFILLMENT_STATUSES.DELIVERED,
    FULFILLMENT_STATUSES.RETURNED,
  ]),
});
