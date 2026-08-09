import { z } from "zod";

import type { Category } from "@stackleo/types";

const categoryStatusSchema = z.enum(["draft", "active", "archived"]);
const categoryVisibilitySchema = z.enum(["public", "private"]);

/**
 * Validates one category as returned by `GET /api/v1/categories` (and
 * friends) — `satisfies z.ZodType<Category>` keeps this schema honest
 * against the shared `Category` type instead of silently drifting from
 * it. Used by apps/web to guard against malformed API responses before
 * they reach the UI.
 */
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  parentId: z.string().nullable(),
  status: categoryStatusSchema,
  visibility: categoryVisibilitySchema,
  sortOrder: z.number(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  seoKeywords: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<Category>;

export const categoryListSchema = z.array(categorySchema);
