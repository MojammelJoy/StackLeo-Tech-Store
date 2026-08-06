import { z } from "zod";

import { couponCodeSchema, notesSchema } from "../schemas";

/**
 * Deliberately has no `items`/`guestEmail`/amount fields: this API is
 * "place order from my cart" only (authenticated users, per this
 * module's requirements) — `OrderService.placeOrder` resolves items
 * from the caller's own cart via `CartCheckoutProvider`, re-validating
 * and re-pricing every one itself (see that method's doc comment), the
 * same reasoning `modules/cart`'s `addCartItemSchema` documents for why
 * a client never submits `unitPrice`. `billingAddressId`/
 * `shippingAddressId` are required for every order and are
 * ownership-checked by `AddressSnapshotProvider` before anything else
 * runs.
 */
export const createOrderSchema = z.object({
  billingAddressId: z.string().min(1),
  shippingAddressId: z.string().min(1),
  couponCode: couponCodeSchema.optional(),
  notes: notesSchema.optional(),
});
