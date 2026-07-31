import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { ApplyCouponDto, CreateCouponDto, UpdateCouponDto } from "../dto";
import type { CouponFilterOptions, EligibilityContext } from "../interfaces";
import type { CouponRepository } from "../repository";
import type { Coupon, CouponValidationResult } from "../types";

/**
 * Skeleton coupon service — the operations a concrete implementation
 * will expose once coupon persistence and real redemption bookkeeping
 * exist. Depends on `CouponRepository` (interface only; see
 * `repository/`) for persistence. Every method throws
 * `NotImplementedError` — no database operations and no business rules
 * (how to compute a discount, how to check product/category/brand
 * eligibility, how to enforce a per-user limit) happen in this
 * foundation; `validate` only returns the *shape* a real
 * implementation's answer would take (see
 * `types/coupon-validation.types.ts`).
 *
 * Write operations accept `actor: AuthenticatedUser` — the caller
 * performing the mutation — so a future concrete implementation can
 * attribute changes without every call site's signature changing later.
 * `validate` accepts an optional `actor` since a guest checkout can
 * still attempt to apply a coupon code (mirroring `modules/order`'s
 * guest/user split); user-specific coupons simply won't validate for a
 * guest once real eligibility checking exists. Nothing here checks
 * `actor`'s permissions; that is `modules/rbac`'s job, applied by
 * whatever middleware sits in front of this service once it exists.
 */
export class CouponService {
  constructor(private readonly couponRepository: CouponRepository) {}

  async findById(id: string): Promise<Coupon | null> {
    throw new NotImplementedError(`CouponService.findById is not implemented yet (id: ${id})`);
  }

  async findByCode(code: string): Promise<Coupon | null> {
    throw new NotImplementedError(
      `CouponService.findByCode is not implemented yet (code: ${code})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: CouponFilterOptions,
  ): Promise<PaginatedResult<Coupon>> {
    throw new NotImplementedError("CouponService.findAll is not implemented yet");
  }

  async create(_dto: CreateCouponDto, _actor: AuthenticatedUser): Promise<Coupon> {
    throw new NotImplementedError("CouponService.create is not implemented yet");
  }

  async update(id: string, _dto: UpdateCouponDto, _actor: AuthenticatedUser): Promise<Coupon> {
    throw new NotImplementedError(`CouponService.update is not implemented yet (id: ${id})`);
  }

  async validate(
    _dto: ApplyCouponDto,
    _context: EligibilityContext,
    _actor?: AuthenticatedUser,
  ): Promise<CouponValidationResult> {
    throw new NotImplementedError("CouponService.validate is not implemented yet");
  }

  async redeem(id: string, _actor: AuthenticatedUser): Promise<Coupon> {
    throw new NotImplementedError(`CouponService.redeem is not implemented yet (id: ${id})`);
  }
}
