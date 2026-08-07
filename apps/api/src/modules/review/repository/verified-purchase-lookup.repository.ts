/** What `VerifiedPurchaseLookupRepository.findVerifiedPurchase` finds —
 * `verifiedAt` isn't included here: it's stamped by
 * `service/review.service.ts` at the moment of verification (when the
 * review is created), not sourced from the order's own history. */
export interface VerifiedPurchase {
  orderId: string;
  orderItemId: string;
}

/**
 * Read-only lookup against the `orders`/`order_items` tables
 * `modules/order` owns — queried directly via Prisma rather than by
 * importing that module's TypeScript code, the same pattern
 * `modules/coupon`'s `ProductCategoryLookupRepository` already
 * established. `ReviewService` depends on this interface, never on
 * Prisma directly.
 */
export interface VerifiedPurchaseLookupRepository {
  /** The caller's earliest completed order item for `productId`, if
   * any — "validate verified purchase before allowing review". `null`
   * when the user has never completed an order containing this
   * product. */
  findVerifiedPurchase(userId: string, productId: string): Promise<VerifiedPurchase | null>;
}
