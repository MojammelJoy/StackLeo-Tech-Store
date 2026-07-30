import { z } from "zod";

import { quantitySchema } from "../schemas";

/**
 * Deliberately excludes `sku`/`productName`/`unitPrice`: a client-supplied
 * price or product snapshot would let a request claim whatever it
 * wants. The service looks the current product details up itself (see
 * `CreateOrderItemInput`'s comment in `types/order-item.types.ts`) — the
 * same reasoning `modules/cart`'s `addCartItemSchema` documents for
 * `unitPrice`.
 */
export const addOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: quantitySchema,
});
