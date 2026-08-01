import type { CategoryResponseDto, CategoryTreeResponseDto } from "../dto";
import type { Category, CategoryNode } from "../types";

/**
 * Contract `mapper/category.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation.
 */
export interface CategoryMapper {
  toResponseDto(category: Category): CategoryResponseDto;
  toResponseList(categories: Category[]): CategoryResponseDto[];
  /** Recursively maps a domain `CategoryNode` (built by
   * `utils/tree.util.ts`) to its public, nested response shape. */
  toTreeResponseDto(node: CategoryNode): CategoryTreeResponseDto;
  toTreeResponseList(nodes: CategoryNode[]): CategoryTreeResponseDto[];
}
