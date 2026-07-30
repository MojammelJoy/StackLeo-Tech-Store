import type { CategoryResponseDto } from "../dto";
import type { CategoryMapper } from "../interfaces";
import type { Category } from "../types";

function toResponseDto(category: Category): CategoryResponseDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
    status: category.status,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

function toResponseList(categories: Category[]): CategoryResponseDto[] {
  return categories.map(toResponseDto);
}

/**
 * The only place a `Category` is converted to its public
 * `CategoryResponseDto` shape — callers map through this instead of
 * building the DTO by hand.
 */
export const categoryMapper: CategoryMapper = { toResponseDto, toResponseList };
