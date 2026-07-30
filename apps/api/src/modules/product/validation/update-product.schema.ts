import { z } from "zod";

import {
  PRODUCT_CURRENCY_CODE_LENGTH,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_PRICE_MIN,
  PRODUCT_STATUSES,
} from "../constants";

/**
 * Deliberately excludes `sku`: a SKU is an identifier, not a general
 * profile field — renaming one is a distinct operation (with its own
 * uniqueness/history concerns) that belongs to its own schema once that
 * flow is built, not a field on a general-purpose update.
 */
export const updateProductSchema = z
  .object({
    name: z.string().min(PRODUCT_NAME_MIN_LENGTH).max(PRODUCT_NAME_MAX_LENGTH),
    description: z.string().max(PRODUCT_DESCRIPTION_MAX_LENGTH),
    price: z.number().int().min(PRODUCT_PRICE_MIN),
    currency: z.string().length(PRODUCT_CURRENCY_CODE_LENGTH),
    status: z.enum([PRODUCT_STATUSES.DRAFT, PRODUCT_STATUSES.ACTIVE, PRODUCT_STATUSES.ARCHIVED]),
    categoryId: z.string(),
  })
  .partial();
