export const WISHLIST_SKU_MAX_LENGTH = 64;

/**
 * A wishlist's lifecycle. Distinct from `modules/cart`'s `CartStatus` —
 * a wishlist has no "converted" state (there's no checkout to convert
 * into); it's either in use or set aside.
 */
export const WISHLIST_STATUSES = {
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export type WishlistStatus = (typeof WISHLIST_STATUSES)[keyof typeof WISHLIST_STATUSES];

/**
 * Whether a wishlist can be viewed by anyone holding its `shareToken`.
 * Exists so the *shape* for wishlist sharing is in place — no share
 * link generation, permission check, or public view endpoint exists
 * anywhere in this foundation; that's future work this shape supports.
 */
export const WISHLIST_VISIBILITIES = {
  PRIVATE: "private",
  SHARED: "shared",
} as const;

export type WishlistVisibility = (typeof WISHLIST_VISIBILITIES)[keyof typeof WISHLIST_VISIBILITIES];

export const WISHLIST_SORTABLE_FIELDS = ["createdAt", "updatedAt"] as const;
export const WISHLIST_FILTERABLE_FIELDS = ["userId", "status", "visibility"] as const;

/** Fields the wishlist *items* listing (see `WishlistRepository.findItemsByWishlistId`) allows sorting/filtering by. */
export const WISHLIST_ITEM_SORTABLE_FIELDS = ["priceAtAdd", "createdAt", "updatedAt"] as const;
export const WISHLIST_ITEM_FILTERABLE_FIELDS = ["notifyOnAvailability"] as const;
