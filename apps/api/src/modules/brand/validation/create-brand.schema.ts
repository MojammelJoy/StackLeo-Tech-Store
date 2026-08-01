import { z } from "zod";

import {
  BRAND_DESCRIPTION_MAX_LENGTH,
  BRAND_MAX_SEO_KEYWORDS,
  BRAND_SEO_DESCRIPTION_MAX_LENGTH,
  BRAND_SEO_KEYWORD_MAX_LENGTH,
  BRAND_SEO_TITLE_MAX_LENGTH,
  BRAND_STATUSES,
  BRAND_VISIBILITIES,
} from "../constants";
import { brandNameSchema, brandSlugSchema, brandUrlSchema } from "../schemas";

/** `slug` is optional — when omitted, `service/brand.service.ts` derives
 * one from `name` (see `utils/slug.util.ts`). When provided explicitly,
 * it's validated and used as-is (after a uniqueness check). Logo
 * metadata is deliberately absent here — see `UpdateBrandInput`'s doc
 * comment in `types/brand.types.ts` for why it has its own dedicated
 * operation, set only after creation. */
export const createBrandSchema = z.object({
  name: brandNameSchema,
  slug: brandSlugSchema.optional(),
  description: z.string().trim().max(BRAND_DESCRIPTION_MAX_LENGTH).nullable().optional(),
  websiteUrl: brandUrlSchema.nullable().optional(),
  status: z
    .enum([BRAND_STATUSES.DRAFT, BRAND_STATUSES.ACTIVE, BRAND_STATUSES.ARCHIVED])
    .default(BRAND_STATUSES.DRAFT),
  visibility: z
    .enum([BRAND_VISIBILITIES.PUBLIC, BRAND_VISIBILITIES.PRIVATE])
    .default(BRAND_VISIBILITIES.PUBLIC),
  seoTitle: z.string().trim().max(BRAND_SEO_TITLE_MAX_LENGTH).nullable().optional(),
  seoDescription: z.string().trim().max(BRAND_SEO_DESCRIPTION_MAX_LENGTH).nullable().optional(),
  seoKeywords: z
    .array(z.string().trim().min(1).max(BRAND_SEO_KEYWORD_MAX_LENGTH))
    .max(BRAND_MAX_SEO_KEYWORDS)
    .optional(),
});
