import { z } from "zod";

import type {
  BulkProductLookupItem,
  BulkProductLookupResponse,
  ProductDetail,
  ProductDetailResponse,
  ProductDisplayImage,
  ProductSpecification,
  ProductStatus,
  ProductVariant,
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

/** Validates one product variant as returned nested in `ProductResponseDto`. */
export const productVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string(),
  name: z.string(),
  attributes: z.record(z.string()),
  price: z.number().nullable(),
  currency: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<ProductVariant>;

/** Validates one product specification as returned nested in `ProductResponseDto`. */
export const productSpecificationSchema = z.object({
  id: z.string(),
  productId: z.string(),
  key: z.string(),
  value: z.string(),
  sortOrder: z.number(),
}) satisfies z.ZodType<ProductSpecification>;

/** Validates a product as returned by `GET /api/v1/products/slug/:slug`
 * and `GET /api/v1/products/:id` — same pattern as
 * `bulkProductLookupItemSchema`, plus nested variants/specifications. */
export const productDetailSchema = z.object({
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
  variants: z.array(productVariantSchema),
  specifications: z.array(productSpecificationSchema),
}) satisfies z.ZodType<ProductDetail>;

/** Validates the `data` payload of `GET /api/v1/products/slug/:slug`
 * and `GET /api/v1/products/:id`. */
export const productDetailResponseSchema = z.object({
  product: productDetailSchema,
}) satisfies z.ZodType<ProductDetailResponse>;
