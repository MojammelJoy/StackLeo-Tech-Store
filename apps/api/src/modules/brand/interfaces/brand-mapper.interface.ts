import type { BrandResponseDto } from "../dto";
import type { Brand } from "../types";

/**
 * Contract `mapper/brand.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation.
 */
export interface BrandMapper {
  toResponseDto(brand: Brand): BrandResponseDto;
  toResponseList(brands: Brand[]): BrandResponseDto[];
}
