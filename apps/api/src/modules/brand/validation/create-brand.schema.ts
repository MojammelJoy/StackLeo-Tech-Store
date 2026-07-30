import { z } from "zod";

import { BRAND_DESCRIPTION_MAX_LENGTH, BRAND_STATUSES } from "../constants";
import { brandNameSchema, brandSlugSchema, brandUrlSchema } from "../schemas";

export const createBrandSchema = z.object({
  name: brandNameSchema,
  slug: brandSlugSchema,
  description: z.string().max(BRAND_DESCRIPTION_MAX_LENGTH).optional(),
  logoUrl: brandUrlSchema.optional(),
  websiteUrl: brandUrlSchema.optional(),
  status: z
    .enum([BRAND_STATUSES.DRAFT, BRAND_STATUSES.ACTIVE, BRAND_STATUSES.ARCHIVED])
    .default(BRAND_STATUSES.DRAFT),
});
