import type { ProductStatus, ProductVisibility } from "../constants";
import type { ProductSpecificationResponseDto } from "./product-specification-response.dto";
import type { ProductVariantResponseDto } from "./product-variant-response.dto";

/**
 * The public-facing shape of a Product without its variants/
 * specifications — what the list/search endpoint returns for every
 * result. Structurally identical to the domain entity today (nothing on
 * `Product` is sensitive), but kept separate so a future internal-only
 * field never needs a "wait, does this leak?" audit — it simply isn't
 * listed here. Built by `mapper/`, never constructed ad hoc.
 */
export interface ProductSummaryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  price: number;
  currency: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  categoryId: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** The full shape returned by the single-product get endpoints — a
 * `ProductSummaryResponseDto` plus its variants and specifications. */
export interface ProductResponseDto extends ProductSummaryResponseDto {
  variants: ProductVariantResponseDto[];
  specifications: ProductSpecificationResponseDto[];
}
