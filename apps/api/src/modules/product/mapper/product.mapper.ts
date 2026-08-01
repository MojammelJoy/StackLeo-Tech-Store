import type {
  ProductResponseDto,
  ProductSpecificationResponseDto,
  ProductSummaryResponseDto,
  ProductVariantResponseDto,
} from "../dto";
import type { ProductMapper } from "../interfaces";
import type { Product, ProductSpecification, ProductVariant } from "../types";

function toSummaryDto(product: Product): ProductSummaryResponseDto {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    sku: product.sku,
    price: product.price,
    currency: product.currency,
    status: product.status,
    visibility: product.visibility,
    categoryId: product.categoryId,
    tags: product.tags,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    seoKeywords: product.seoKeywords,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function toSummaryList(products: Product[]): ProductSummaryResponseDto[] {
  return products.map(toSummaryDto);
}

function toVariantResponseDto(variant: ProductVariant): ProductVariantResponseDto {
  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    name: variant.name,
    attributes: variant.attributes,
    price: variant.price,
    currency: variant.currency,
    isActive: variant.isActive,
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
  };
}

function toSpecificationResponseDto(
  specification: ProductSpecification,
): ProductSpecificationResponseDto {
  return {
    id: specification.id,
    productId: specification.productId,
    key: specification.key,
    value: specification.value,
    sortOrder: specification.sortOrder,
  };
}

function toResponseDto(
  product: Product,
  variants: ProductVariant[],
  specifications: ProductSpecification[],
): ProductResponseDto {
  return {
    ...toSummaryDto(product),
    variants: variants.map(toVariantResponseDto),
    specifications: specifications.map(toSpecificationResponseDto),
  };
}

/**
 * The only place a `Product`/`ProductVariant`/`ProductSpecification` is
 * converted to its public response shape — callers map through this
 * instead of building any of these DTOs by hand.
 */
export const productMapper: ProductMapper = {
  toSummaryDto,
  toSummaryList,
  toResponseDto,
  toVariantResponseDto,
  toSpecificationResponseDto,
};
