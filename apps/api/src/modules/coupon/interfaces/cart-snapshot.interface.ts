import type { AuthenticatedUser } from "../../../auth";

/**
 * The minimal cart facts `CouponService.apply`/`validate`/`removeFromCart`
 * need — never the full Cart shape. `total`/`currency` come from the
 * cart's own live-priced summary (never a client-supplied amount, so a
 * caller can't fabricate a bigger cart to defeat `minOrderAmount`), and
 * `productIds` feeds the product/category/brand eligibility check (see
 * `interfaces/coupon-eligibility.interface.ts`).
 */
export interface CartCouponSnapshot {
  id: string;
  currency: string;
  total: number;
  productIds: string[];
}

/**
 * `CouponService`'s only integration point with `modules/cart` — a real
 * `CartService` instance, adapted down to this narrow interface by
 * whichever composition root builds `CouponService` (see
 * `routes/coupon.routes.ts`), the same decoupled-provider pattern
 * `modules/payment`'s `OrderLookupProvider` established. Resolves "the"
 * cart from `actor` alone (mirroring `CartService.getCartForUser`) —
 * every coupon-application endpoint is authenticated-only, so there is
 * never a guest cart to resolve here.
 */
export interface CartSnapshotProvider {
  getOwnedCartSnapshot(actor: AuthenticatedUser): Promise<CartCouponSnapshot>;
}
