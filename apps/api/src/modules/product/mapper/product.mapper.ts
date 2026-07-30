import type { ProductResponseDto } from "../dto";
import type { ProductMapper } from "../interfaces";
import type { Product } from "../types";

function toResponseDto(product: Product): ProductResponseDto {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    sku: product.sku,
    price: product.price,
    currency: product.currency,
    status: product.status,
    categoryId: product.categoryId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function toResponseList(products: Product[]): ProductResponseDto[] {
  return products.map(toResponseDto);
}

/**
 * The only place a `Product` is converted to its public `ProductResponseDto`
 * shape — callers map through this instead of building the DTO by hand.
 */
export const productMapper: ProductMapper = { toResponseDto, toResponseList };
