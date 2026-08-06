import type { AuthenticatedUser } from "../../../auth";
import type { CartResponseDto } from "../../cart";

/**
 * The one integration point `WishlistService.moveItemToCart` uses to
 * actually add a product to the caller's cart — a thin, single-method
 * view of `modules/cart`'s real `CartService`, satisfied by it
 * structurally without this module importing `CartService`'s class
 * (only its already-public `CartResponseDto` response type). Kept as
 * its own narrow interface, mirroring `modules/cart`'s own
 * `ProductAvailabilityRepository`, so `WishlistService` depends on a
 * contract it owns rather than reaching into a sibling module's
 * concrete implementation directly; `routes/wishlist.routes.ts` (the
 * composition root, exactly where cross-module wiring belongs) is the
 * only place a real `CartService` instance is ever constructed and
 * adapted to this shape.
 *
 * This is a deliberate, narrow exception to "no module imports a
 * sibling's business logic": "move wishlist item to cart" is
 * inherently a real integration between the two modules — reimplementing
 * cart-add logic here instead would violate this task's own "do not
 * implement Cart CRUD" constraint far more directly than a type-level
 * dependency on Cart's already-public service contract does.
 */
export interface CartItemAdder {
  addItemToCart(actor: AuthenticatedUser, productId: string, sku: string): Promise<CartResponseDto>;
}
