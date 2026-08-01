import { z } from "zod";

import {
  BRAND_DESCRIPTION_MAX_LENGTH,
  BRAND_MAX_SEO_KEYWORDS,
  BRAND_SEO_DESCRIPTION_MAX_LENGTH,
  BRAND_SEO_KEYWORD_MAX_LENGTH,
  BRAND_SEO_TITLE_MAX_LENGTH,
} from "../constants";
import { brandNameSchema, brandUrlSchema } from "../schemas";

/**
 * Deliberately excludes `slug`, `status`, `visibility`, and logo
 * metadata — see `UpdateBrandInput`'s comment in `types/brand.types.ts`
 * for why each has its own dedicated operation instead of living on
 * this general update.
 */
export const updateBrandSchema = z
  .object({
    name: brandNameSchema,
    description: z.string().trim().max(BRAND_DESCRIPTION_MAX_LENGTH).nullable(),
    websiteUrl: brandUrlSchema.nullable(),
    seoTitle: z.string().trim().max(BRAND_SEO_TITLE_MAX_LENGTH).nullable(),
    seoDescription: z.string().trim().max(BRAND_SEO_DESCRIPTION_MAX_LENGTH).nullable(),
    seoKeywords: z
      .array(z.string().trim().min(1).max(BRAND_SEO_KEYWORD_MAX_LENGTH))
      .max(BRAND_MAX_SEO_KEYWORDS),
  })
  .partial();
