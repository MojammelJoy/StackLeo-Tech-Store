import { z } from "zod";

import {
  PRODUCT_CURRENCY_CODE_LENGTH,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_PRICE_MIN,
  PRODUCT_SKU_MAX_LENGTH,
  PRODUCT_STATUSES,
} from "../constants";

export const createProductSchema = z.object({
  name: z.string().min(PRODUCT_NAME_MIN_LENGTH).max(PRODUCT_NAME_MAX_LENGTH),
  description: z.string().max(PRODUCT_DESCRIPTION_MAX_LENGTH).optional(),
  sku: z.string().min(1).max(PRODUCT_SKU_MAX_LENGTH),
  price: z.number().int().min(PRODUCT_PRICE_MIN),
  currency: z.string().length(PRODUCT_CURRENCY_CODE_LENGTH),
  status: z
    .enum([PRODUCT_STATUSES.DRAFT, PRODUCT_STATUSES.ACTIVE, PRODUCT_STATUSES.ARCHIVED])
    .default(PRODUCT_STATUSES.DRAFT),
  categoryId: z.string().optional(),
});
