/**
 * The minimal product facts `OrderService.placeOrder` needs to
 * re-validate a cart item and snapshot it into an `OrderItem` — never
 * the full `Product` shape. `deletedAt`/`status`/`visibility` are read
 * to decide sellability the same way `modules/cart`'s
 * `ProductAvailabilityRepository` does (a soft-deleted, non-`active`,
 * or non-`public` product can't be ordered), duplicated as bare
 * strings for the same decoupling reason `modules/search` documents on
 * `SEARCH_VISIBLE_STATUS` — this module never imports `modules/product`.
 * Includes `name` (unlike `modules/cart`'s/`modules/wishlist`'s own
 * versions of this lookup) since "store product snapshot inside order
 * items" needs `OrderItem.productName`, which neither of those callers
 * ever needed.
 */
export interface ProductOrderSnapshot {
  id: string;
  name: string;
  sku: string;
  /** Minor currency unit (e.g. cents for USD), matching `Product.price`. */
  price: number;
  currency: string;
  status: string;
  visibility: string;
  deletedAt: Date | null;
}

/**
 * Read-only lookup against the `products` table `modules/product` owns
 * — queried directly via Prisma rather than by importing that module's
 * TypeScript code, the same pattern `modules/search`/`modules/cart`/
 * `modules/wishlist` already established for cross-catalog reads.
 * `OrderService` depends on this interface, never on Prisma directly.
 */
export interface ProductSnapshotRepository {
  findManyByIds(productIds: string[]): Promise<Map<string, ProductOrderSnapshot>>;
}
