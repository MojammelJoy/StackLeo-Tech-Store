import type { ProductResponseDto } from "../dto";
import type { Product } from "../types";

/**
 * Contract `mapper/product.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation.
 */
export interface ProductMapper {
  toResponseDto(product: Product): ProductResponseDto;
  toResponseList(products: Product[]): ProductResponseDto[];
}
