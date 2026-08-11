export interface ProductAvailabilitySnapshot {
  id: string;
  sku: string;
  price: number;
  currency: string;
  status: string;
  visibility: string;
  deletedAt: Date | null;
}

/**
 * The minimal facts `CartService` needs about a *variant* — mirrors
 * `ProductAvailabilitySnapshot`'s reasoning exactly, but for
 * `product_variants` instead of `products`. `price`/`currency` stay
 * nullable (a variant may not override either): `CartService` resolves
 * the effective value itself (the variant's own value, falling back to
 * its parent product's), never this repository.
 */
export interface ProductVariantAvailabilitySnapshot {
  id: string;
  productId: string;
  sku: string;
  price: number | null;
  currency: string | null;
  isActive: boolean;
}

/**
 * Read-only lookups against the `products`/`product_variants`/
 * `inventory_items` tables that `modules/product`/`modules/inventory`
 * own — queried directly via Prisma rather than by importing either
 * module's TypeScript code, the same pattern `modules/search`'s
 * `SearchPrismaRepository` already established for cross-catalog reads.
 * `CartService` depends on this interface, never on Prisma directly, so
 * persistence stays swappable and testable like every other repository
 * in this app.
 */
export interface ProductAvailabilityRepository {
  findById(productId: string): Promise<ProductAvailabilitySnapshot | null>;
  findManyByIds(productIds: string[]): Promise<Map<string, ProductAvailabilitySnapshot>>;
  /** By the variant's own (globally unique) `sku` — never scoped by
   * `productId` at the query level; `CartService` cross-checks
   * `variant.productId` against the id the caller supplied itself. */
  findVariantBySku(sku: string): Promise<ProductVariantAvailabilitySnapshot | null>;
  findManyVariantsBySkus(skus: string[]): Promise<Map<string, ProductVariantAvailabilitySnapshot>>;
  /** Total available quantity (`quantity - reservedQuantity`, floored
   * at `0`) for `sku`, summed across every warehouse. `0` for a SKU
   * with no `InventoryItem` row at all. Works identically for a base
   * product's own sku or a variant's — inventory rows are keyed by bare
   * `sku` string, with no notion of "product" vs "variant" at all. */
  getAvailableQuantity(sku: string): Promise<number>;
}
