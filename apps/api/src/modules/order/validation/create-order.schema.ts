import { z } from "zod";

import { ORDER_MIN_ITEM_COUNT } from "../constants";
import { couponCodeSchema, notesSchema } from "../schemas";

import { addOrderItemSchema } from "./add-order-item.schema";

/**
 * `guestEmail` is optional here on purpose: a caller placing an order
 * as a registered user never supplies one (the service derives identity
 * from `actor` instead — see `service/order.service.ts`), while a guest
 * checkout does, for order confirmation/lookup. `billingAddressId`/
 * `shippingAddressId` are required for every order regardless. Never a
 * currency/amount field: those are computed server-side from the
 * priced items, not submitted by the client.
 */
export const createOrderSchema = z.object({
  guestEmail: z.string().email().optional(),
  billingAddressId: z.string().min(1),
  shippingAddressId: z.string().min(1),
  couponCode: couponCodeSchema.optional(),
  notes: notesSchema.optional(),
  items: z.array(addOrderItemSchema).min(ORDER_MIN_ITEM_COUNT),
});
