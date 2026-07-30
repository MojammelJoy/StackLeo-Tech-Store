import { z } from "zod";

import { CART_ITEM_MAX_QUANTITY, CART_ITEM_MIN_QUANTITY } from "../constants";

export const quantitySchema = z
  .number()
  .int()
  .min(CART_ITEM_MIN_QUANTITY)
  .max(CART_ITEM_MAX_QUANTITY);
