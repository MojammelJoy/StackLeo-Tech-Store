import { z } from "zod";

import {
  PRODUCT_CURRENCY_CODE_LENGTH,
  PRODUCT_PRICE_MIN,
  PRODUCT_VARIANT_NAME_MAX_LENGTH,
} from "../constants";

import { productVariantAttributesSchema } from "./product-variant-attributes.schema";

export const updateProductVariantSchema = z
  .object({
    name: z.string().trim().min(1).max(PRODUCT_VARIANT_NAME_MAX_LENGTH),
    attributes: productVariantAttributesSchema,
    price: z.number().int().min(PRODUCT_PRICE_MIN).nullable(),
    currency: z.string().trim().length(PRODUCT_CURRENCY_CODE_LENGTH).toUpperCase().nullable(),
    isActive: z.boolean(),
  })
  .partial();
