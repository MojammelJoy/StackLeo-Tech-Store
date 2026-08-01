import { z } from "zod";

import {
  CATEGORY_DESCRIPTION_MAX_LENGTH,
  CATEGORY_MAX_SEO_KEYWORDS,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
  CATEGORY_SEO_DESCRIPTION_MAX_LENGTH,
  CATEGORY_SEO_KEYWORD_MAX_LENGTH,
  CATEGORY_SEO_TITLE_MAX_LENGTH,
} from "../constants";

/**
 * Deliberately excludes `slug`, `status`, and `visibility` — see
 * `types/category.types.ts`'s `UpdateCategoryInput` for why each has
 * its own dedicated operation instead of living on this general update.
 * `parentId: null` explicitly moves the category to top-level;
 * omitting `parentId` entirely leaves it where it is.
 */
export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(CATEGORY_NAME_MIN_LENGTH).max(CATEGORY_NAME_MAX_LENGTH),
    description: z.string().trim().max(CATEGORY_DESCRIPTION_MAX_LENGTH).nullable(),
    parentId: z.string().trim().min(1).nullable(),
    sortOrder: z.number().int(),
    seoTitle: z.string().trim().max(CATEGORY_SEO_TITLE_MAX_LENGTH).nullable(),
    seoDescription: z.string().trim().max(CATEGORY_SEO_DESCRIPTION_MAX_LENGTH).nullable(),
    seoKeywords: z
      .array(z.string().trim().min(1).max(CATEGORY_SEO_KEYWORD_MAX_LENGTH))
      .max(CATEGORY_MAX_SEO_KEYWORDS),
  })
  .partial();
