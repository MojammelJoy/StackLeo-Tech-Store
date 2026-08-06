import type { AuthenticatedUser } from "../../../auth";

/** The minimal order facts `PaymentService.create`/`retry` need to
 * validate a payment attempt against — never the full `Order`
 * response shape. `status` is a bare string (this module never imports
 * `modules/order`'s `ORDER_STATUSES`, the same decoupling
 * `types/payment.types.ts`'s doc comment documents for `orderId`
 * itself). */
export interface OrderPaymentSnapshot {
  id: string;
  userId: string | null;
  status: string;
  currency: string;
  total: number;
}

/**
 * `PaymentService`'s only integration point with `modules/order` —
 * mirrors `modules/order`'s own `AddressSnapshotProvider`/
 * `CartCheckoutProvider` exactly: a thin interface satisfied by an
 * adapter built from `modules/order`'s real `OrderService` in
 * `routes/payment.routes.ts` (the composition root), never a direct
 * import of `OrderService`'s class here. Reusing `OrderService`'s own
 * ownership check (rather than re-querying `Order` rows directly) is
 * what actually enforces "validate order before payment" — a customer
 * can never pay against an order that isn't theirs, and the order's
 * real `total`/`currency` (not whatever the client claims) is what a
 * payment attempt gets checked against.
 */
export interface OrderLookupProvider {
  /** Throws `NotFoundError` if `orderId` doesn't exist or isn't owned
   * by `actor` — see `modules/order`'s `OrderService.getById`. */
  getOwnedOrder(actor: AuthenticatedUser, orderId: string): Promise<OrderPaymentSnapshot>;
}
