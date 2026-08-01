import { z } from "zod";

import {
  CATEGORY_DESCRIPTION_MAX_LENGTH,
  CATEGORY_MAX_SEO_KEYWORDS,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
  CATEGORY_SEO_DESCRIPTION_MAX_LENGTH,
  CATEGORY_SEO_KEYWORD_MAX_LENGTH,
  CATEGORY_SEO_TITLE_MAX_LENGTH,
  CATEGORY_SLUG_MAX_LENGTH,
  CATEGORY_SLUG_PATTERN,
  CATEGORY_STATUSES,
  CATEGORY_VISIBILITIES,
} from "../constants";

/** Same character-set-then-shape validation as
 * `modules/product`'s (nonexistent) slug schema would be — see
 * `constants/category.constants.ts`'s doc comment on
 * `CATEGORY_SLUG_PATTERN` for why leading/trailing/double-hyphen checks
 * are plain string methods rather than a more complex regex. */
const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(CATEGORY_SLUG_MAX_LENGTH)
  .regex(CATEGORY_SLUG_PATTERN, "Slug must contain only lowercase letters, numbers, and hyphens")
  .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), {
    message: "Slug must not start or end with a hyphen",
  })
  .refine((slug) => !slug.includes("--"), {
    message: "Slug must not contain consecutive hyphens",
  });

/** `slug` is optional — when omitted, `service/category.service.ts`
 * derives one from `name` (see `utils/slug.util.ts`). When provided
 * explicitly, it's validated and used as-is (after a uniqueness check),
 * for a caller that wants a specific URL rather than a derived one. */
export const createCategorySchema = z.object({
  name: z.string().trim().min(CATEGORY_NAME_MIN_LENGTH).max(CATEGORY_NAME_MAX_LENGTH),
  slug: slugSchema.optional(),
  description: z.string().trim().max(CATEGORY_DESCRIPTION_MAX_LENGTH).nullable().optional(),
  parentId: z.string().trim().min(1).optional(),
  status: z
    .enum([CATEGORY_STATUSES.DRAFT, CATEGORY_STATUSES.ACTIVE, CATEGORY_STATUSES.ARCHIVED])
    .default(CATEGORY_STATUSES.DRAFT),
  visibility: z
    .enum([CATEGORY_VISIBILITIES.PUBLIC, CATEGORY_VISIBILITIES.PRIVATE])
    .default(CATEGORY_VISIBILITIES.PUBLIC),
  sortOrder: z.number().int().default(0),
  seoTitle: z.string().trim().max(CATEGORY_SEO_TITLE_MAX_LENGTH).nullable().optional(),
  seoDescription: z.string().trim().max(CATEGORY_SEO_DESCRIPTION_MAX_LENGTH).nullable().optional(),
  seoKeywords: z
    .array(z.string().trim().min(1).max(CATEGORY_SEO_KEYWORD_MAX_LENGTH))
    .max(CATEGORY_MAX_SEO_KEYWORDS)
    .optional(),
});
