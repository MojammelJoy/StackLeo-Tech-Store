import type { CategoryResponseDto } from "./category-response.dto";

/** What `GET /categories/tree` and `GET /categories/:id/tree` return —
 * a `CategoryResponseDto` plus its children, recursively. Built by
 * `mapper/category.mapper.ts`'s `toTreeResponseDto` from a domain
 * `CategoryNode` (see `utils/tree.util.ts`). */
export interface CategoryTreeResponseDto extends CategoryResponseDto {
  children: CategoryTreeResponseDto[];
}
