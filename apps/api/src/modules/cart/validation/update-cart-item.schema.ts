import { z } from "zod";

import { quantitySchema } from "../schemas";

export const updateCartItemSchema = z
  .object({
    quantity: quantitySchema,
    selected: z.boolean(),
  })
  .partial();
