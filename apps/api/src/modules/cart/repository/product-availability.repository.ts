/**
 * The minimal product facts `CartService` needs to validate an add/
 * update-item request and to price a cart at current rates — never the
 * full `Product` shape. `deletedAt`/`status`/`visibility` are read to
 * decide sellability the same way `modules/product`'s own
 * `ProductService.isVisibleTo` does (a soft-deleted, non-`active`, or
 * non-`public` product is not addable to a cart), duplicated as bare
 * strings for the same decoupling reason `modules/search` documents on
 * `SEARCH_VISIBLE_STATUS` — this module never imports `modules/product`.
 */
export interface ProductAvailabilitySnapshot {
  id: string;
  sku: string;
  /** Minor currency unit (e.g. cents for USD), matching `Product.price`. */
  price: number;
  currency: string;
  status: string;
  visibility: string;
  deletedAt: Date | null;
}

/**
 * Read-only lookups against the `products`/`inventory_items` tables
 * that `modules/product`/`modules/inventory` own — queried directly via
 * Prisma rather than by importing either module's TypeScript code, the
 * same pattern `modules/search`'s `SearchPrismaRepository` already
 * established for cross-catalog reads. `CartService` depends on this
 * interface, never on Prisma directly, so persistence stays swappable
 * and testable like every other repository in this app.
 */
export interface ProductAvailabilityRepository {
  findById(productId: string): Promise<ProductAvailabilitySnapshot | null>;
  findManyByIds(productIds: string[]): Promise<Map<string, ProductAvailabilitySnapshot>>;
  /** Total available quantity (`quantity - reservedQuantity`, floored
   * at `0`) for `sku`, summed across every warehouse. `0` for a SKU
   * with no `InventoryItem` row at all. */
  getAvailableQuantity(sku: string): Promise<number>;
}
