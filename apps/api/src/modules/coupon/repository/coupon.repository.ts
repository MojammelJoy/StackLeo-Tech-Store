import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CouponFilterOptions } from "../interfaces";
import type {
  CreateCouponInput,
  Coupon,
  CouponRedemption,
  CreateCouponRedemptionInput,
  UpdateCouponInput,
} from "../types";

/** Read options every single-coupon lookup accepts — `includeDeleted` is
 * only ever honored for an admin-permission-gated caller (see
 * `service/coupon.service.ts`), never taken at face value from a
 * request, mirroring `modules/brand`'s `BrandLookupOptions`. */
export interface CouponLookupOptions {
  includeDeleted?: boolean;
}

/**
 * Persistence contract for the Coupon domain entity plus its redemption
 * ledger. The service depends on this interface, never on a concrete
 * implementation directly, so swapping `CouponPrismaRepository` for a
 * test double (or a different persistence layer entirely) never touches
 * service code.
 *
 * `applyRedemption` is the one write that must be atomic —
 * incrementing `Coupon.usageCount` and inserting the explaining
 * `CouponRedemption` row must never be observed independently (see its
 * Prisma implementation's doc comment). `countUserRedemptions` counts
 * every redemption ever created for `(couponId, userId)`, active or
 * removed — a per-user usage limit tracks how many times a user has
 * ever applied the coupon, not how many carts currently hold it.
 */
export interface CouponRepository {
  findById(id: string, options?: CouponLookupOptions): Promise<Coupon | null>;
  findByCode(code: string, options?: CouponLookupOptions): Promise<Coupon | null>;
  findAll(query: ParsedQuery, filters?: CouponFilterOptions): Promise<PaginatedResult<Coupon>>;
  create(data: CreateCouponInput): Promise<Coupon>;
  update(id: string, data: UpdateCouponInput): Promise<Coupon>;
  /** Soft delete — sets `deletedAt`, never removes the row. */
  softDelete(id: string): Promise<void>;
  /** Reverses `softDelete` — clears `deletedAt`. */
  restore(id: string): Promise<void>;

  countUserRedemptions(couponId: string, userId: string): Promise<number>;
  /** The active (`removedAt: null`) redemption of `couponId` against
   * `cartId`, if any — the duplicate-application guard. */
  findActiveRedemption(cartId: string, couponId: string): Promise<CouponRedemption | null>;
  /** Every active redemption currently applied to `cartId` — the
   * stacking check. */
  findActiveRedemptionsForCart(cartId: string): Promise<CouponRedemption[]>;
  applyRedemption(
    data: CreateCouponRedemptionInput,
  ): Promise<{ coupon: Coupon; redemption: CouponRedemption }>;
  /** Soft-removes a redemption (`removedAt: now()`), never a hard
   * delete — see `prisma/schema.prisma`'s `CouponRedemption` doc
   * comment for why. */
  removeRedemption(id: string): Promise<void>;
}
