/** The minimal product facts `CouponService.buildEligibilityContext`
 * needs to evaluate `Coupon.eligibleCategoryIds`/`eligibleBrandIds` —
 * never the full `Product` shape. */
export interface ProductCategoryFacts {
  categoryId: string | null;
  brandId: string | null;
}

/**
 * Read-only lookup against the `products` table `modules/product` owns —
 * queried directly via Prisma rather than by importing that module's
 * TypeScript code, the same pattern `modules/order`'s
 * `ProductSnapshotRepository`/`modules/cart`'s
 * `ProductAvailabilityRepository` already established. `CouponService`
 * depends on this interface, never on Prisma directly.
 */
export interface ProductCategoryLookupRepository {
  findManyByIds(productIds: string[]): Promise<Map<string, ProductCategoryFacts>>;
}
