import type { ProductSpecification, UpsertProductSpecificationInput } from "../types";

/**
 * Persistence contract for `ProductSpecification`. Exposes a single
 * "replace the whole set" write (`replaceAll`) rather than granular
 * per-row CRUD — see `types/product-specification.types.ts`'s doc
 * comment on `UpsertProductSpecificationInput` for why.
 */
export interface ProductSpecificationRepository {
  findByProductId(productId: string): Promise<ProductSpecification[]>;
  /** Atomically replaces every specification row for `productId` with
   * `items` — a mid-way failure never leaves the product with a
   * half-replaced set. */
  replaceAll(
    productId: string,
    items: UpsertProductSpecificationInput[],
  ): Promise<ProductSpecification[]>;
}
