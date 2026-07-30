import { z } from "zod";

import { BRAND_SLUG_MAX_LENGTH, BRAND_SLUG_PATTERN } from "../constants";

/**
 * Reusable slug validation — used by `validation/create-brand.schema.ts`
 * only (a slug is immutable after creation; see `UpdateBrandInput`'s
 * comment). Kept here rather than inline so any future module needing
 * the same "lowercase, hyphen-separated, no leading/trailing/double
 * hyphen" rule doesn't have to re-derive it.
 */
export const brandSlugSchema = z
  .string()
  .max(BRAND_SLUG_MAX_LENGTH)
  .regex(BRAND_SLUG_PATTERN, "Slug must contain only lowercase letters, numbers, and hyphens")
  .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), {
    message: "Slug must not start or end with a hyphen",
  })
  .refine((slug) => !slug.includes("--"), {
    message: "Slug must not contain consecutive hyphens",
  });
