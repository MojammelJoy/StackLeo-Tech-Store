import type { AuthenticatedUser } from "../../../auth";

/** One product line as it exists on the caller's cart at checkout time
 * — just enough for `OrderService.placeOrder` to re-validate and
 * re-snapshot against the live product/inventory data itself (see
 * `repository/product-snapshot.repository.ts`); never trusted as the
 * final price or product name. */
export interface CartCheckoutItem {
  productId: string;
  sku: string;
  quantity: number;
}

export interface CartCheckoutSource {
  id: string;
  currency: string;
  items: CartCheckoutItem[];
}

/**
 * `OrderService.placeOrder`'s only integration point with
 * `modules/cart` — a thin, two-method view of `modules/cart`'s real
 * `CartService`, satisfied by an adapter built from it structurally
 * (this module never imports `CartService`'s class, only this
 * interface's shape). Mirrors `modules/wishlist`'s `CartItemAdder`: the
 * composition root (`routes/order.routes.ts`) constructs the one real
 * `CartService` instance and adapts it to this shape — the only place
 * cross-module wiring happens, exactly where it belongs. "Do not
 * implement Cart CRUD" is why this exists at all: checkout must reuse
 * `modules/cart`'s actual cart-reading/converting logic rather than
 * reimplementing it here.
 */
export interface CartCheckoutProvider {
  /** Resolves the caller's active cart. Throws if they have none, or
   * if it has no items — "Validate cart before placing order" starts
   * here, before any product/inventory/address validation runs. */
  getCartForCheckout(actor: AuthenticatedUser): Promise<CartCheckoutSource>;
  /** Marks the cart `CART_STATUSES.CONVERTED` once the order it became
   * has been persisted — see `modules/cart`'s `CartService.convertCart`. */
  markCartConverted(cartId: string, actor: AuthenticatedUser): Promise<void>;
}
