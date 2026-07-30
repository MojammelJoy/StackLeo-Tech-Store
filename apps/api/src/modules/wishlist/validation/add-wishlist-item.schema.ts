import { z } from "zod";

import { skuSchema } from "../schemas";

/**
 * Deliberately excludes `priceAtAdd`: a client-supplied price snapshot
 * would let a request claim any price it wants. The service looks the
 * current price up itself (see `CreateWishlistItemInput`'s comment in
 * `types/wishlist-item.types.ts`) — the same reasoning
 * `modules/cart`'s `addCartItemSchema` documents for `unitPrice`.
 */
export const addWishlistItemSchema = z.object({
  productId: z.string().min(1),
  sku: skuSchema,
  notifyOnAvailability: z.boolean().default(false),
});
