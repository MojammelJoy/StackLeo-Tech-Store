import type {
  ProductResponseDto,
  ProductSpecificationResponseDto,
  ProductSummaryResponseDto,
  ProductVariantResponseDto,
} from "../dto";
import type { Product, ProductSpecification, ProductVariant } from "../types";

/**
 * Contract `mapper/product.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation.
 *
 * `toSummaryDto`/`toSummaryList` (no variants/specifications — used by
 * the list/search endpoint) are deliberately separate from
 * `toResponseDto` (the full shape, used by the single-product get
 * endpoints) — a listing page never needs every variant/spec row for
 * every result.
 */
export interface ProductMapper {
  toSummaryDto(product: Product): ProductSummaryResponseDto;
  toSummaryList(products: Product[]): ProductSummaryResponseDto[];
  toResponseDto(
    product: Product,
    variants: ProductVariant[],
    specifications: ProductSpecification[],
  ): ProductResponseDto;
  toVariantResponseDto(variant: ProductVariant): ProductVariantResponseDto;
  toSpecificationResponseDto(specification: ProductSpecification): ProductSpecificationResponseDto;
}
