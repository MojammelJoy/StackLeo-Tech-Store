import { z } from "zod";

import {
  PRODUCT_CURRENCY_CODE_LENGTH,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_MAX_SEO_KEYWORDS,
  PRODUCT_MAX_SPECIFICATIONS,
  PRODUCT_MAX_TAGS,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_PRICE_MIN,
  PRODUCT_SEO_DESCRIPTION_MAX_LENGTH,
  PRODUCT_SEO_KEYWORD_MAX_LENGTH,
  PRODUCT_SEO_TITLE_MAX_LENGTH,
  PRODUCT_SKU_MAX_LENGTH,
  PRODUCT_STATUSES,
  PRODUCT_TAG_MAX_LENGTH,
  PRODUCT_VISIBILITIES,
} from "../constants";

import { createProductVariantSchema } from "./create-product-variant.schema";
import {
  productSpecificationItemSchema,
  uniqueSpecificationKeys,
} from "./product-specification-item.schema";

const MAX_INITIAL_VARIANTS = 50;

function uniqueVariantSkus(variants: { sku: string }[]): boolean {
  return new Set(variants.map((variant) => variant.sku)).size === variants.length;
}

/** `variants`/`specifications` are optional initial rows created in the
 * same transaction as the product itself (see
 * `ProductRepository.createWithRelations`) — a convenience for setting
 * up a fully-formed product in one call; both can still be managed
 * afterward via their own dedicated endpoints. */
export const createProductSchema = z
  .object({
    name: z.string().trim().min(PRODUCT_NAME_MIN_LENGTH).max(PRODUCT_NAME_MAX_LENGTH),
    description: z.string().trim().max(PRODUCT_DESCRIPTION_MAX_LENGTH).nullable().optional(),
    sku: z.string().trim().min(1).max(PRODUCT_SKU_MAX_LENGTH),
    price: z.number().int().min(PRODUCT_PRICE_MIN),
    currency: z.string().trim().length(PRODUCT_CURRENCY_CODE_LENGTH).toUpperCase(),
    status: z
      .enum([PRODUCT_STATUSES.DRAFT, PRODUCT_STATUSES.ACTIVE, PRODUCT_STATUSES.ARCHIVED])
      .default(PRODUCT_STATUSES.DRAFT),
    visibility: z
      .enum([PRODUCT_VISIBILITIES.PUBLIC, PRODUCT_VISIBILITIES.PRIVATE])
      .default(PRODUCT_VISIBILITIES.PUBLIC),
    categoryId: z.string().trim().min(1).optional(),
    tags: z
      .array(z.string().trim().min(1).max(PRODUCT_TAG_MAX_LENGTH))
      .max(PRODUCT_MAX_TAGS)
      .optional(),
    seoTitle: z.string().trim().max(PRODUCT_SEO_TITLE_MAX_LENGTH).nullable().optional(),
    seoDescription: z.string().trim().max(PRODUCT_SEO_DESCRIPTION_MAX_LENGTH).nullable().optional(),
    seoKeywords: z
      .array(z.string().trim().min(1).max(PRODUCT_SEO_KEYWORD_MAX_LENGTH))
      .max(PRODUCT_MAX_SEO_KEYWORDS)
      .optional(),
    variants: z.array(createProductVariantSchema).max(MAX_INITIAL_VARIANTS).optional(),
    specifications: z
      .array(productSpecificationItemSchema)
      .max(PRODUCT_MAX_SPECIFICATIONS)
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.variants && !uniqueVariantSkus(data.variants)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Variant SKUs must be unique",
        path: ["variants"],
      });
    }
    if (data.specifications && !uniqueSpecificationKeys(data.specifications)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specification keys must be unique",
        path: ["specifications"],
      });
    }
  });
