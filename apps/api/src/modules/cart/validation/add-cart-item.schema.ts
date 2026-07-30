import { z } from "zod";

import { quantitySchema } from "../schemas";

/**
 * Deliberately excludes `unitPrice`: a client-supplied price would let
 * a request pay whatever it wants for an item. The service looks the
 * current price up itself (see `CreateCartItemInput`'s comment in
 * `types/cart-item.types.ts`) — the actual lookup is out of scope for
 * this foundation, but the DTO shape is what enforces the client can
 * never provide one.
 */
export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  sku: z.string().min(1),
  quantity: quantitySchema,
});
