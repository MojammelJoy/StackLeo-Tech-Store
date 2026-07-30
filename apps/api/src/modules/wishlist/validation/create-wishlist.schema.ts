import { z } from "zod";

import { guestTokenSchema } from "../schemas";

/**
 * `guestToken` is optional here on purpose: a caller creating an
 * authenticated wishlist never supplies one (the service derives
 * identity from `actor` instead — see `service/wishlist.service.ts`),
 * while a caller creating a guest wishlist does. Mirrors
 * `modules/cart`'s `createCartSchema`.
 */
export const createWishlistSchema = z.object({
  guestToken: guestTokenSchema.optional(),
});
