import type { WishlistItemResponseDto, WishlistResponseDto } from "../dto";
import type { WishlistMapper } from "../interfaces";
import type { Wishlist, WishlistItem } from "../types";

function toItemResponseDto(item: WishlistItem): WishlistItemResponseDto {
  return {
    id: item.id,
    productId: item.productId,
    sku: item.sku,
    priceAtAdd: item.priceAtAdd,
    notifyOnAvailability: item.notifyOnAvailability,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function toItemResponseList(items: WishlistItem[]): WishlistItemResponseDto[] {
  return items.map(toItemResponseDto);
}

function toWishlistResponseDto(wishlist: Wishlist, items: WishlistItem[]): WishlistResponseDto {
  return {
    id: wishlist.id,
    userId: wishlist.userId,
    guestToken: wishlist.guestToken,
    visibility: wishlist.visibility,
    status: wishlist.status,
    items: toItemResponseList(items),
    itemCount: items.length,
    createdAt: wishlist.createdAt,
    updatedAt: wishlist.updatedAt,
  };
}

/**
 * The only place a `Wishlist`/`WishlistItem` is converted to its public
 * response DTO shape — callers map through this instead of building
 * either DTO by hand.
 */
export const wishlistMapper: WishlistMapper = {
  toItemResponseDto,
  toItemResponseList,
  toWishlistResponseDto,
};
