import type { ProductSummaryResponseDto } from "./product-response.dto";

/**
 * A product's chosen display image for compact storefront contexts
 * (cart lines, wishlist tiles) — see
 * `repository/product-image-lookup.repository.prisma.ts` for the exact
 * deterministic selection rule. `null` when the product has no
 * qualifying image.
 */
export interface ProductDisplayImageDto {
  id: string;
  url: string;
  altText: string | null;
}

/** What `GET /products/bulk` returns for each product — a
 * `ProductSummaryResponseDto` plus its display image. */
export interface BulkProductResponseDto extends ProductSummaryResponseDto {
  image: ProductDisplayImageDto | null;
}
