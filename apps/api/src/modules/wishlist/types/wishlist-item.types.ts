import type { ProductReference } from "../interfaces";

/**
 * The persisted WishlistItem domain entity. `priceAtAdd` is a snapshot
 * taken when the item was added — not a live lookup against
 * `modules/product` — the same reasoning `modules/cart`'s `CartItem`
 * documents for its own price snapshot; here it exists specifically so
 * a future notification feature can detect "the price dropped since
 * you added this" (see `utils/price-comparison.util.ts`).
 */
export interface WishlistItem extends ProductReference {
  id: string;
  wishlistId: string;
  priceAtAdd: number;
  /** Whether the owner wants to be notified about this item (price drop, back in stock) once a notification module exists. Nothing in this foundation sends one. */
  notifyOnAvailability: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Repository-level creation input. `priceAtAdd` is populated by the service after a price lookup, never taken from client input — see `dto/add-wishlist-item.dto.ts`. */
export interface CreateWishlistItemInput extends ProductReference {
  wishlistId: string;
  priceAtAdd: number;
  notifyOnAvailability?: boolean;
}

/** Deliberately narrow: the product reference and price snapshot are immutable once added — only the notification preference can change. */
export interface UpdateWishlistItemInput {
  notifyOnAvailability?: boolean;
}
