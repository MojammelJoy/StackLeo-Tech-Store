import { z } from "zod";

import type {
  BulkProductLookupItem,
  BulkProductLookupResponse,
  ProductDisplayImage,
  ProductStatus,
  ProductVisibility,
} from "@stackleo/types";

const productStatusSchema = z.enum([
  "draft",
  "active",
  "archived",
]) satisfies z.ZodType<ProductStatus>;

const productVisibilitySchema = z.enum([
  "public",
  "private",
]) satisfies z.ZodType<ProductVisibility>;

const productDisplayImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  altText: z.string().nullable(),
}) satisfies z.ZodType<ProductDisplayImage>;

/** Validates one product as returned by `GET /api/v1/products/bulk` —
 * same pattern as `category.schema.ts`'s `categorySchema`. */
export const bulkProductLookupItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  sku: z.string(),
  price: z.number(),
  currency: z.string(),
  status: productStatusSchema,
  visibility: productVisibilitySchema,
  categoryId: z.string().nullable(),
  tags: z.array(z.string()),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  seoKeywords: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  image: productDisplayImageSchema.nullable(),
}) satisfies z.ZodType<BulkProductLookupItem>;

/** Validates the `data` payload of `GET /api/v1/products/bulk` — same
 * pattern as `cart.schema.ts`'s `cartResponseSchema`. */
export const bulkProductLookupResponseSchema = z.object({
  products: z.array(bulkProductLookupItemSchema),
}) satisfies z.ZodType<BulkProductLookupResponse>;
