import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CouponFilterOptions } from "../interfaces";
import type { CreateCouponInput, Coupon, UpdateCouponInput } from "../types";

/**
 * Persistence contract for the Coupon domain entity. The service
 * depends on this interface, never on a concrete implementation
 * directly, so swapping `CouponPrismaRepository` for a test double (or a
 * different persistence layer entirely) never touches service code.
 * `incrementUsageCount` and `countUserRedemptions` are kept separate
 * from `update` since they represent redemption bookkeeping, not an
 * admin-initiated edit to the coupon's own fields.
 */
export interface CouponRepository {
  findById(id: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  findAll(query: ParsedQuery, filters?: CouponFilterOptions): Promise<PaginatedResult<Coupon>>;
  create(data: CreateCouponInput): Promise<Coupon>;
  update(id: string, data: UpdateCouponInput): Promise<Coupon>;
  incrementUsageCount(id: string): Promise<Coupon>;
  countUserRedemptions(couponId: string, userId: string): Promise<number>;
}
