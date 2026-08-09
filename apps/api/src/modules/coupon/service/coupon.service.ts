import { ConflictError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";
import { COUPON_STATUSES, COUPON_VALIDATION_ERROR_CODES } from "../constants";
import { couponMapper } from "../mapper";
import {
  calculateDiscount,
  hasStarted,
  isExpired,
  isUsageLimitReached,
  normalizeCouponCode,
} from "../utils";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CouponValidationErrorCode, CurrencyCode } from "../constants";
import type {
  ApplyCouponDto,
  CouponApplicationResponseDto,
  CreateCouponDto,
  CouponResponseDto,
  CouponValidationResponseDto,
  UpdateCouponDto,
} from "../dto";
import type {
  CartCouponSnapshot,
  CartSnapshotProvider,
  CouponFilterOptions,
  EligibilityContext,
} from "../interfaces";
import type { CouponRepository, ProductCategoryLookupRepository } from "../repository";
import type { Coupon, CouponValidationResult } from "../types";

/**
 * Implements every Coupon API operation: admin CRUD (create/update/soft
 * delete/restore/list), self-service lookup (by id/code), and cart
 * integration (validate/apply/remove) — enforcing status, the
 * start/expiry window, global and per-user usage limits, minimum order
 * amount, currency agreement, and user/product/category/brand
 * eligibility restrictions before ever letting a coupon be applied.
 * Depends on `CouponRepository` (interface only; see `repository/`),
 * `CartSnapshotProvider` (this module's only integration point with
 * `modules/cart` — see that interface's doc comment), and
 * `ProductCategoryLookupRepository` (a direct, read-only lookup against
 * the `products` table, never `modules/product`'s TypeScript code) —
 * never Prisma or another module's service directly.
 *
 * Coupon application is authenticated-users-only end to end: every
 * write method (and `validate`/`apply`/`removeFromCart`) takes a real
 * `actor: AuthenticatedUser`, and `CartSnapshotProvider.getOwnedCartSnapshot`
 * always resolves the caller's own cart — there is no guest coupon
 * path, matching `modules/payment`'s "no guest/public path at all".
 */
export class CouponService {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly cartSnapshot: CartSnapshotProvider,
    private readonly productCategoryLookup: ProductCategoryLookupRepository,
  ) {}

  async findById(id: string): Promise<CouponResponseDto> {
    const coupon = await this.couponRepository.findById(id, { includeDeleted: true });
    if (!coupon) {
      throw new NotFoundError("Coupon not found");
    }
    return couponMapper.toResponseDto(coupon);
  }

  /** Self-service preview: a caller who already knows a code can look up
   * what it does before attempting to apply it. Never reveals a
   * soft-deleted coupon — `includeDeleted` stays `false` here, unlike
   * the admin-only `findById`. */
  async findByCode(code: string): Promise<CouponResponseDto> {
    const coupon = await this.couponRepository.findByCode(normalizeCouponCode(code));
    if (!coupon) {
      throw new NotFoundError("Coupon not found");
    }
    return couponMapper.toResponseDto(coupon);
  }

  async findAll(
    query: ParsedQuery,
    filters: CouponFilterOptions,
  ): Promise<PaginatedResult<CouponResponseDto>> {
    const result = await this.couponRepository.findAll(query, filters);
    return { items: couponMapper.toResponseList(result.items), meta: result.meta };
  }

  async create(dto: CreateCouponDto, actor: AuthenticatedUser): Promise<CouponResponseDto> {
    const code = normalizeCouponCode(dto.code);
    const existing = await this.couponRepository.findByCode(code, { includeDeleted: true });
    if (existing) {
      throw new ConflictError(`A coupon with code "${code}" already exists`);
    }

    const coupon = await this.couponRepository.create({
      code,
      description: dto.description ?? null,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      currency: dto.currency,
      maxDiscountAmount: dto.maxDiscountAmount ?? null,
      minOrderAmount: dto.minOrderAmount ?? null,
      startsAt: dto.startsAt ?? null,
      expiresAt: dto.expiresAt ?? null,
      usageLimit: dto.usageLimit ?? null,
      usageLimitPerUser: dto.usageLimitPerUser ?? null,
      stackable: dto.stackable ?? false,
      eligibleUserIds: dto.eligibleUserIds ?? null,
      eligibleProductIds: dto.eligibleProductIds ?? null,
      eligibleCategoryIds: dto.eligibleCategoryIds ?? null,
      eligibleBrandIds: dto.eligibleBrandIds ?? null,
    });

    logger.info({ couponId: coupon.id, code: coupon.code, actorId: actor.id }, "Coupon created");
    return couponMapper.toResponseDto(coupon);
  }

  async update(
    id: string,
    dto: UpdateCouponDto,
    actor: AuthenticatedUser,
  ): Promise<CouponResponseDto> {
    const existing = await this.couponRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Coupon not found");
    }

    const updated = await this.couponRepository.update(id, dto);
    logger.info({ couponId: id, actorId: actor.id }, "Coupon updated");
    return couponMapper.toResponseDto(updated);
  }

  async delete(id: string, actor: AuthenticatedUser): Promise<void> {
    const existing = await this.couponRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Coupon not found");
    }

    await this.couponRepository.softDelete(id);
    logger.info({ couponId: id, actorId: actor.id }, "Coupon soft-deleted");
  }

  async restore(id: string, actor: AuthenticatedUser): Promise<CouponResponseDto> {
    const existing = await this.couponRepository.findById(id, { includeDeleted: true });
    if (!existing) {
      throw new NotFoundError("Coupon not found");
    }
    if (!existing.deletedAt) {
      throw new ConflictError("Coupon is not deleted");
    }

    await this.couponRepository.restore(id);
    const restored = await this.couponRepository.findById(id);
    if (!restored) {
      throw new NotFoundError("Coupon not found");
    }

    logger.info({ couponId: id, actorId: actor.id }, "Coupon restored");
    return couponMapper.toResponseDto(restored);
  }

  /** Read-only check: what `evaluateCoupon` would decide right now for
   * `actor`'s own cart, including the discount it would compute — never
   * mutates usage counts or creates a redemption. */
  async validate(
    dto: ApplyCouponDto,
    actor: AuthenticatedUser,
  ): Promise<CouponValidationResponseDto> {
    const { context } = await this.buildEligibilityContext(actor);
    const result = await this.evaluateCoupon(dto.code, context);
    return couponMapper.toValidationResponseDto(result);
  }

  /**
   * Applies a coupon to `actor`'s own cart: re-runs every validation
   * `validate` does (never trusting a client-supplied "it's valid"),
   * then guards against re-applying the same coupon to the same cart and
   * against combining a non-stackable coupon with any other already
   * applied, before atomically incrementing the coupon's usage count and
   * recording the redemption (`CouponRepository.applyRedemption`).
   */
  async apply(
    dto: ApplyCouponDto,
    actor: AuthenticatedUser,
  ): Promise<CouponApplicationResponseDto> {
    const { context, cart } = await this.buildEligibilityContext(actor);
    const result = await this.evaluateCoupon(dto.code, context);

    if (!result.valid || !result.coupon || result.discountAmount === null) {
      throw new ConflictError(result.errorMessage ?? "Coupon cannot be applied");
    }
    const coupon = result.coupon;

    const activeRedemption = await this.couponRepository.findActiveRedemption(cart.id, coupon.id);
    if (activeRedemption) {
      throw new ConflictError("This coupon is already applied to your cart");
    }

    const existingRedemptions = await this.couponRepository.findActiveRedemptionsForCart(cart.id);
    const hasNonStackableApplied = existingRedemptions.some((redemption) => !redemption.stackable);
    if (hasNonStackableApplied || (!coupon.stackable && existingRedemptions.length > 0)) {
      throw new ConflictError(
        "This coupon cannot be combined with the coupon(s) already applied to your cart",
      );
    }

    const { coupon: updatedCoupon, redemption } = await this.couponRepository.applyRedemption({
      couponId: coupon.id,
      userId: actor.id,
      cartId: cart.id,
      discountAmount: result.discountAmount,
      currency: cart.currency as CurrencyCode,
      expectedUsageLimit: coupon.usageLimit,
    });

    logger.info(
      {
        couponId: coupon.id,
        cartId: cart.id,
        actorId: actor.id,
        discountAmount: result.discountAmount,
      },
      "Coupon applied to cart",
    );
    return couponMapper.toApplicationResponseDto(updatedCoupon, redemption);
  }

  /** Removes `code`'s active redemption from `actor`'s own cart — a
   * soft removal (see `CouponRepository.removeRedemption`), never
   * decrements `Coupon.usageCount`: the redemption already counted
   * against the coupon's usage limits and stays counted. */
  async removeFromCart(code: string, actor: AuthenticatedUser): Promise<void> {
    const cart = await this.cartSnapshot.getOwnedCartSnapshot(actor);
    const coupon = await this.couponRepository.findByCode(normalizeCouponCode(code));
    if (!coupon) {
      throw new NotFoundError("Coupon not found");
    }

    const activeRedemption = await this.couponRepository.findActiveRedemption(cart.id, coupon.id);
    if (!activeRedemption) {
      throw new NotFoundError("This coupon is not applied to your cart");
    }

    await this.couponRepository.removeRedemption(activeRedemption.id);
    logger.info(
      { couponId: coupon.id, cartId: cart.id, actorId: actor.id },
      "Coupon removed from cart",
    );
  }

  /**
   * The single evaluation path both `validate` and `apply` share:
   * lookup → status → start/expiry window → global usage limit →
   * currency agreement → minimum order amount → user/product/category/
   * brand eligibility → per-user usage limit → safe discount
   * calculation. Order matters only for which single error code a
   * caller sees first; every check still runs against a freshly-read
   * coupon, so `apply` never acts on a stale decision.
   */
  private async evaluateCoupon(
    code: string,
    context: EligibilityContext,
  ): Promise<CouponValidationResult> {
    const coupon = await this.couponRepository.findByCode(normalizeCouponCode(code));
    if (!coupon) {
      return this.invalid(null, COUPON_VALIDATION_ERROR_CODES.NOT_FOUND, "Coupon not found");
    }
    if (coupon.status !== COUPON_STATUSES.ACTIVE) {
      return this.invalid(coupon, COUPON_VALIDATION_ERROR_CODES.INACTIVE, "Coupon is not active");
    }
    if (!hasStarted(coupon)) {
      return this.invalid(
        coupon,
        COUPON_VALIDATION_ERROR_CODES.NOT_STARTED,
        "Coupon is not active yet",
      );
    }
    if (isExpired(coupon)) {
      return this.invalid(coupon, COUPON_VALIDATION_ERROR_CODES.EXPIRED, "Coupon has expired");
    }
    if (isUsageLimitReached(coupon)) {
      return this.invalid(
        coupon,
        COUPON_VALIDATION_ERROR_CODES.USAGE_LIMIT_REACHED,
        "Coupon usage limit has been reached",
      );
    }
    if (coupon.currency !== context.currency) {
      return this.invalid(
        coupon,
        COUPON_VALIDATION_ERROR_CODES.CURRENCY_MISMATCH,
        `Coupon currency "${coupon.currency}" does not match cart currency "${context.currency}"`,
      );
    }
    if (coupon.minOrderAmount !== null && context.orderAmount < coupon.minOrderAmount) {
      return this.invalid(
        coupon,
        COUPON_VALIDATION_ERROR_CODES.MIN_ORDER_AMOUNT_NOT_MET,
        `Order amount does not meet the coupon's minimum of ${coupon.minOrderAmount}`,
      );
    }
    if (!this.isEligible(coupon, context)) {
      return this.invalid(
        coupon,
        COUPON_VALIDATION_ERROR_CODES.NOT_ELIGIBLE,
        "This coupon is not eligible for your cart",
      );
    }
    if (context.userId && coupon.usageLimitPerUser !== null) {
      const userRedemptions = await this.couponRepository.countUserRedemptions(
        coupon.id,
        context.userId,
      );
      if (userRedemptions >= coupon.usageLimitPerUser) {
        return this.invalid(
          coupon,
          COUPON_VALIDATION_ERROR_CODES.USER_USAGE_LIMIT_REACHED,
          "You have already used this coupon the maximum number of times",
        );
      }
    }

    return {
      valid: true,
      coupon,
      errorCode: null,
      errorMessage: null,
      discountAmount: calculateDiscount(coupon, context.orderAmount),
    };
  }

  private isEligible(coupon: Coupon, context: EligibilityContext): boolean {
    if (coupon.eligibleUserIds !== null) {
      if (!context.userId || !coupon.eligibleUserIds.includes(context.userId)) {
        return false;
      }
    }
    if (coupon.eligibleProductIds !== null) {
      if (!context.productIds.some((id) => coupon.eligibleProductIds?.includes(id))) {
        return false;
      }
    }
    if (coupon.eligibleCategoryIds !== null) {
      if (!context.categoryIds.some((id) => coupon.eligibleCategoryIds?.includes(id))) {
        return false;
      }
    }
    if (coupon.eligibleBrandIds !== null) {
      if (!context.brandIds.some((id) => coupon.eligibleBrandIds?.includes(id))) {
        return false;
      }
    }
    return true;
  }

  private invalid(
    coupon: Coupon | null,
    errorCode: CouponValidationErrorCode,
    errorMessage: string,
  ): CouponValidationResult {
    return { valid: false, coupon, errorCode, errorMessage, discountAmount: null };
  }

  /** Resolves `actor`'s own cart via `CartSnapshotProvider`, then
   * batches a single product lookup across every distinct product in it
   * to derive `categoryIds`/`brandIds` for `EligibilityContext`. */
  private async buildEligibilityContext(
    actor: AuthenticatedUser,
  ): Promise<{ context: EligibilityContext; cart: CartCouponSnapshot }> {
    const cart = await this.cartSnapshot.getOwnedCartSnapshot(actor);
    const productFacts = await this.productCategoryLookup.findManyByIds(cart.productIds);

    const categoryIds = new Set<string>();
    const brandIds = new Set<string>();
    for (const facts of productFacts.values()) {
      if (facts.categoryId) {
        categoryIds.add(facts.categoryId);
      }
      if (facts.brandId) {
        brandIds.add(facts.brandId);
      }
    }

    const context: EligibilityContext = {
      userId: actor.id,
      orderAmount: cart.total,
      currency: cart.currency as CurrencyCode,
      productIds: cart.productIds,
      categoryIds: [...categoryIds],
      brandIds: [...brandIds],
    };
    return { context, cart };
  }
}
