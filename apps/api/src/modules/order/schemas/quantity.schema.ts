import { z } from "zod";

import { ORDER_ITEM_MAX_QUANTITY, ORDER_ITEM_MIN_QUANTITY } from "../constants";

export const quantitySchema = z
  .number()
  .int()
  .min(ORDER_ITEM_MIN_QUANTITY)
  .max(ORDER_ITEM_MAX_QUANTITY);
