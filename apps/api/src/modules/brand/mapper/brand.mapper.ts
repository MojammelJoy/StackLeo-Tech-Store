import type { BrandResponseDto } from "../dto";
import type { BrandMapper } from "../interfaces";
import type { Brand } from "../types";

function toResponseDto(brand: Brand): BrandResponseDto {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    logoUrl: brand.logoUrl,
    logoAltText: brand.logoAltText,
    logoUpdatedAt: brand.logoUpdatedAt,
    websiteUrl: brand.websiteUrl,
    status: brand.status,
    visibility: brand.visibility,
    seoTitle: brand.seoTitle,
    seoDescription: brand.seoDescription,
    seoKeywords: brand.seoKeywords,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
}

function toResponseList(brands: Brand[]): BrandResponseDto[] {
  return brands.map(toResponseDto);
}

/**
 * The only place a `Brand` is converted to its public `BrandResponseDto`
 * shape — callers map through this instead of building the DTO by hand.
 */
export const brandMapper: BrandMapper = { toResponseDto, toResponseList };
