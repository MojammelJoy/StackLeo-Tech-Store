/**
 * The bare foreign-key-shaped reference a wishlist item holds to a
 * product — never an import of `modules/product` (this foundation
 * stays decoupled from it, the same way every module in this monorepo
 * stays decoupled from its siblings). Shared between
 * `types/wishlist-item.types.ts` (`WishlistItem`/`CreateWishlistItemInput`
 * both extend it) and `dto/add-wishlist-item.dto.ts` (the client-facing
 * shape mirrors it), which is why it lives here rather than in either.
 */
export interface ProductReference {
  productId: string;
  sku: string;
}
