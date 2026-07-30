import type { WishlistStatus, WishlistVisibility } from "../constants";

/**
 * Wishlist-specific filter criteria, layered on top of `common/`'s
 * generic `ParsedQuery` (pagination/sort/search). Shared between
 * `repository/` (the contract) and `service/` (the skeleton) — the
 * reason this lives in its own `interfaces/` folder rather than inside
 * either one.
 */
export interface WishlistFilterOptions {
  userId?: string;
  status?: WishlistStatus;
  visibility?: WishlistVisibility;
}
