import type { CategoryResponseDto, CategoryTreeResponseDto } from "../dto";
import type { CategoryMapper } from "../interfaces";
import type { Category, CategoryNode } from "../types";

function toResponseDto(category: Category): CategoryResponseDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
    status: category.status,
    visibility: category.visibility,
    sortOrder: category.sortOrder,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    seoKeywords: category.seoKeywords,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

function toResponseList(categories: Category[]): CategoryResponseDto[] {
  return categories.map(toResponseDto);
}

function toTreeResponseDto(node: CategoryNode): CategoryTreeResponseDto {
  return {
    ...toResponseDto(node),
    children: node.children.map(toTreeResponseDto),
  };
}

function toTreeResponseList(nodes: CategoryNode[]): CategoryTreeResponseDto[] {
  return nodes.map(toTreeResponseDto);
}

/**
 * The only place a `Category`/`CategoryNode` is converted to its public
 * response shape — callers map through this instead of building either
 * DTO by hand.
 */
export const categoryMapper: CategoryMapper = {
  toResponseDto,
  toResponseList,
  toTreeResponseDto,
  toTreeResponseList,
};
