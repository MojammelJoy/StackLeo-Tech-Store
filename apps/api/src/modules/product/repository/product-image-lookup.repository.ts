export interface ProductDisplayImage {
  id: string;
  url: string;
  altText: string | null;
}

/**
 * Read-only lookup against the `media_assets` table that `modules/media`
 * owns — queried directly via Prisma rather than by importing that
 * module's TypeScript code, the same decoupling pattern
 * `modules/cart`'s `ProductAvailabilityRepository` already established
 * for its own cross-catalog reads (see
 * `apps/api/src/modules/cart/repository/product-availability.repository.ts`'s
 * doc comment). `ProductService` depends on this interface, never on
 * Prisma directly.
 */
export interface ProductImageLookupRepository {
  /**
   * One display image per product that has a qualifying one, keyed by
   * product id — a product with none is simply absent from the map
   * (never a `null`/`undefined` value). See the Prisma implementation's
   * doc comment for the exact deterministic selection rule.
   */
  findDisplayImagesByProductIds(productIds: string[]): Promise<Map<string, ProductDisplayImage>>;
}
