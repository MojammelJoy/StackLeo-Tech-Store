import type { WishlistResponseDto } from "./wishlist-response.dto";
import type { CartResponseDto } from "../../cart";

/** What `POST /wishlist/items/:itemId/move-to-cart` returns — both
 * sides of the operation's outcome: the product's new home (`cart`)
 * and the wishlist it just left (`wishlist`), so a caller never has to
 * issue a second request to see either. */
export interface MoveToCartResponseDto {
  wishlist: WishlistResponseDto;
  cart: CartResponseDto;
}
