import { z } from "zod";

import {
  PRODUCT_CURRENCY_CODE_LENGTH,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_MAX_SEO_KEYWORDS,
  PRODUCT_MAX_TAGS,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_PRICE_MIN,
  PRODUCT_SEO_DESCRIPTION_MAX_LENGTH,
  PRODUCT_SEO_KEYWORD_MAX_LENGTH,
  PRODUCT_SEO_TITLE_MAX_LENGTH,
  PRODUCT_TAG_MAX_LENGTH,
} from "../constants";

/**
 * Deliberately excludes `sku`, `slug`, `status`, and `visibility` — see
 * `types/product.types.ts`'s `UpdateProductInput` for why each of those
 * has its own dedicated operation instead of living on this general
 * update.
 */
export const updateProductSchema = z
  .object({
    name: z.string().trim().min(PRODUCT_NAME_MIN_LENGTH).max(PRODUCT_NAME_MAX_LENGTH),
    description: z.string().trim().max(PRODUCT_DESCRIPTION_MAX_LENGTH).nullable(),
    price: z.number().int().min(PRODUCT_PRICE_MIN),
    currency: z.string().trim().length(PRODUCT_CURRENCY_CODE_LENGTH).toUpperCase(),
    categoryId: z.string().trim().min(1).nullable(),
    tags: z.array(z.string().trim().min(1).max(PRODUCT_TAG_MAX_LENGTH)).max(PRODUCT_MAX_TAGS),
    seoTitle: z.string().trim().max(PRODUCT_SEO_TITLE_MAX_LENGTH).nullable(),
    seoDescription: z.string().trim().max(PRODUCT_SEO_DESCRIPTION_MAX_LENGTH).nullable(),
    seoKeywords: z
      .array(z.string().trim().min(1).max(PRODUCT_SEO_KEYWORD_MAX_LENGTH))
      .max(PRODUCT_MAX_SEO_KEYWORDS),
  })
  .partial();
