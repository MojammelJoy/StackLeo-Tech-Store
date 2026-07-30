import type { CartItemResponseDto, CartResponseDto } from "../dto";
import type { Cart, CartItem } from "../types";

/**
 * Contract `mapper/cart.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation.
 */
export interface CartMapper {
  toItemResponseDto(item: CartItem): CartItemResponseDto;
  toItemResponseList(items: CartItem[]): CartItemResponseDto[];
  /** Composes a cart, its items, and their computed `CartSummary` (see `utils/price-calculator.util.ts`) into one response shape. */
  toCartResponseDto(cart: Cart, items: CartItem[]): CartResponseDto;
}
