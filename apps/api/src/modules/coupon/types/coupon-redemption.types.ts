import type { CurrencyCode } from "../constants";

/**
 * One "coupon applied to cart" association — see `prisma/schema.prisma`'s
 * `CouponRedemption` doc comment for why this is a soft-removable ledger
 * row rather than a plain join. `stackable` is denormalized from the
 * owning `Coupon` at read time (never stored on this row itself) so
 * `CouponService`'s stacking check never needs a second round trip per
 * redemption.
 */
export interface CouponRedemption {
  id: string;
  couponId: string;
  userId: string;
  cartId: string;
  discountAmount: number;
  currency: CurrencyCode;
  stackable: boolean;
  removedAt: Date | null;
  createdAt: Date;
}

/** Repository-level creation input for `CouponRepository.applyRedemption`
 * — deliberately excludes `stackable` (read back from the joined
 * `Coupon` row, never written onto `CouponRedemption` itself).
 *
 * `expectedUsageLimit` is the `Coupon.usageLimit` value
 * `CouponService.apply` already read moments earlier while validating
 * the coupon — passed through so the repository can make the
 * `usageCount` increment conditional on that same limit, atomically, in
 * the same statement. Without this, two simultaneous `apply()` calls
 * against a `usageLimit`-capped coupon can both pass the service's
 * read-then-decide validation before either has incremented
 * `usageCount`, letting `usageCount` exceed `usageLimit` — see
 * `CouponPrismaRepository.applyRedemption`'s doc comment. */
export interface CreateCouponRedemptionInput {
  couponId: string;
  userId: string;
  cartId: string;
  discountAmount: number;
  currency: CurrencyCode;
  expectedUsageLimit: number | null;
}
