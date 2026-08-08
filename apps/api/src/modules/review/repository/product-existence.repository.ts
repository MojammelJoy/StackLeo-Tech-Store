/**
 * Read-only existence check against the `products` table
 * `modules/product` owns — queried directly via Prisma rather than by
 * importing that module's TypeScript code, the same pattern
 * `modules/coupon`'s `ProductCategoryLookupRepository`/`modules/order`'s
 * `ProductSnapshotRepository` already established. `ReviewService`
 * depends on this interface, never on Prisma directly.
 */
export interface ProductExistenceRepository {
  /** `false` for a product id with no row, or whose row is soft-deleted
   * — a deleted product no longer "exists" for review purposes. */
  exists(productId: string): Promise<boolean>;
}
