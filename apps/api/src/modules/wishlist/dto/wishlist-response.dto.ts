import type { WishlistStatus, WishlistVisibility } from "../constants";
import type { WishlistItemResponseDto } from "./wishlist-item-response.dto";

/**
 * The public-facing shape of a Wishlist, including its items — the
 * realistic "get my wishlist" response shape, mirroring
 * `modules/cart`'s `CartResponseDto`. `items` is a flat list rather than
 * a `PaginatedResult`, since a full wishlist view is expected to be
 * small; `WishlistService.findItems` (backed by
 * `WishlistRepository.findItemsByWishlistId`) is the paginated/sortable
 * entry point for when that isn't true.
 */
export interface WishlistResponseDto {
  id: string;
  userId: string | null;
  guestToken: string | null;
  visibility: WishlistVisibility;
  status: WishlistStatus;
  items: WishlistItemResponseDto[];
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}
