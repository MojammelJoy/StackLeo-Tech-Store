import type { AuthenticatedUser } from "../../../auth";
import type { AddressSnapshot } from "../types";

/**
 * `OrderService.placeOrder`'s only integration point with
 * `modules/address` — mirrors `interfaces/cart-checkout.interface.ts`'s
 * `CartCheckoutProvider` exactly: a thin interface satisfied by an
 * adapter built from `modules/address`'s real `AddressService` in
 * `routes/order.routes.ts` (the composition root), never a direct
 * import of `AddressService`'s class here. Reusing `AddressService`'s
 * own ownership check (rather than re-querying `Address` rows directly
 * the way `modules/cart`'s `ProductAvailabilityRepository` queries
 * `products`) is what actually enforces "Validate address ownership"
 * for billing/shipping addresses at checkout — a customer can never
 * snapshot an address that isn't theirs into an order.
 */
export interface AddressSnapshotProvider {
  /** Throws `NotFoundError` if `addressId` doesn't exist or isn't
   * owned by `actor` — see `modules/address`'s `AddressService.getById`. */
  getOwnedAddressSnapshot(actor: AuthenticatedUser, addressId: string): Promise<AddressSnapshot>;
}
