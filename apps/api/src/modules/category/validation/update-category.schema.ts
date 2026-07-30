import { z } from "zod";

import {
  CATEGORY_DESCRIPTION_MAX_LENGTH,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
  CATEGORY_STATUSES,
} from "../constants";

/**
 * Deliberately excludes `slug` — see `UpdateCategoryInput`'s comment in
 * `types/category.types.ts` for why.
 */
export const updateCategorySchema = z
  .object({
    name: z.string().min(CATEGORY_NAME_MIN_LENGTH).max(CATEGORY_NAME_MAX_LENGTH),
    description: z.string().max(CATEGORY_DESCRIPTION_MAX_LENGTH),
    parentId: z.string(),
    status: z.enum([CATEGORY_STATUSES.DRAFT, CATEGORY_STATUSES.ACTIVE, CATEGORY_STATUSES.ARCHIVED]),
  })
  .partial();
