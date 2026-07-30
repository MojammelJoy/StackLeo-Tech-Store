import { z } from "zod";

/** Only `notifyOnAvailability` is mutable post-add — see `UpdateWishlistItemInput`'s comment in `types/wishlist-item.types.ts`. */
export const updateWishlistItemSchema = z
  .object({
    notifyOnAvailability: z.boolean(),
  })
  .partial();
