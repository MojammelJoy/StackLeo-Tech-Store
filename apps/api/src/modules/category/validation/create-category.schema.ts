import { z } from "zod";

import {
  CATEGORY_DESCRIPTION_MAX_LENGTH,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
  CATEGORY_SLUG_MAX_LENGTH,
  CATEGORY_SLUG_PATTERN,
  CATEGORY_STATUSES,
} from "../constants";

const slugSchema = z
  .string()
  .max(CATEGORY_SLUG_MAX_LENGTH)
  .regex(CATEGORY_SLUG_PATTERN, "Slug must contain only lowercase letters, numbers, and hyphens")
  .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), {
    message: "Slug must not start or end with a hyphen",
  })
  .refine((slug) => !slug.includes("--"), {
    message: "Slug must not contain consecutive hyphens",
  });

export const createCategorySchema = z.object({
  name: z.string().min(CATEGORY_NAME_MIN_LENGTH).max(CATEGORY_NAME_MAX_LENGTH),
  slug: slugSchema,
  description: z.string().max(CATEGORY_DESCRIPTION_MAX_LENGTH).optional(),
  parentId: z.string().optional(),
  status: z
    .enum([CATEGORY_STATUSES.DRAFT, CATEGORY_STATUSES.ACTIVE, CATEGORY_STATUSES.ARCHIVED])
    .default(CATEGORY_STATUSES.DRAFT),
});
