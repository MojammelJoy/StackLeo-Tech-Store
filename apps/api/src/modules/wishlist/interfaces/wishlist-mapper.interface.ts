import type { WishlistItemResponseDto, WishlistResponseDto } from "../dto";
import type { Wishlist, WishlistItem } from "../types";

/**
 * Contract `mapper/wishlist.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation.
 */
export interface WishlistMapper {
  toItemResponseDto(item: WishlistItem): WishlistItemResponseDto;
  toItemResponseList(items: WishlistItem[]): WishlistItemResponseDto[];
  toWishlistResponseDto(wishlist: Wishlist, items: WishlistItem[]): WishlistResponseDto;
}
