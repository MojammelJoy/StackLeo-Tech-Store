/**
 * The minimal product facts `WishlistService` needs to validate an
 * add-item request — never the full `Product` shape. `deletedAt`/
 * `status`/`visibility` are read to decide "can this be wishlisted" the
 * same way `modules/product`'s own `ProductService.isVisibleTo` decides
 * public visibility (a soft-deleted, non-`active`, or non-`public`
 * product cannot be added — letting a customer wishlist an arbitrary
 * guessed product id would leak the existence of unpublished catalog
 * items), duplicated as bare strings for the same decoupling reason
 * `modules/search` documents on `SEARCH_VISIBLE_STATUS` — this module
 * never imports `modules/product`.
 */
export interface ProductSnapshot {
  id: string;
  sku: string;
  /** Minor currency unit (e.g. cents for USD), matching `Product.price`. */
  price: number;
  status: string;
  visibility: string;
  deletedAt: Date | null;
}

/**
 * Read-only lookup against the `products` table `modules/product` owns
 * — queried directly via Prisma rather than by importing
 * `modules/product`'s TypeScript code, the same pattern
 * `modules/search`/`modules/cart` already established for cross-catalog
 * reads. `WishlistService` depends on this interface, never on Prisma
 * directly.
 */
export interface ProductLookupRepository {
  findById(productId: string): Promise<ProductSnapshot | null>;
}
