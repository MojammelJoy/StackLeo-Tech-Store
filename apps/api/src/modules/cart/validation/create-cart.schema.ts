import { z } from "zod";

import { CART_DEFAULT_CURRENCY } from "../constants";
import { currencySchema } from "../schemas";

/**
 * `guestToken` is optional here on purpose: a caller creating an
 * authenticated cart never supplies one (the service derives identity
 * from `actor` instead — see `service/cart.service.ts`), while a caller
 * creating a guest cart does.
 */
export const createCartSchema = z.object({
  currency: currencySchema.default(CART_DEFAULT_CURRENCY),
  guestToken: z.string().min(1).optional(),
});
