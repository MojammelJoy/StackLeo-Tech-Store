import { z } from "zod";

import { BRAND_DESCRIPTION_MAX_LENGTH, BRAND_STATUSES } from "../constants";
import { brandNameSchema, brandUrlSchema } from "../schemas";

/**
 * Deliberately excludes `slug` — see `UpdateBrandInput`'s comment in
 * `types/brand.types.ts` for why.
 */
export const updateBrandSchema = z
  .object({
    name: brandNameSchema,
    description: z.string().max(BRAND_DESCRIPTION_MAX_LENGTH),
    logoUrl: brandUrlSchema,
    websiteUrl: brandUrlSchema,
    status: z.enum([BRAND_STATUSES.DRAFT, BRAND_STATUSES.ACTIVE, BRAND_STATUSES.ARCHIVED]),
  })
  .partial();
