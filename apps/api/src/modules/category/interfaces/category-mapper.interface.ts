import type { CategoryResponseDto } from "../dto";
import type { Category } from "../types";

/**
 * Contract `mapper/category.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation.
 */
export interface CategoryMapper {
  toResponseDto(category: Category): CategoryResponseDto;
  toResponseList(categories: Category[]): CategoryResponseDto[];
}
