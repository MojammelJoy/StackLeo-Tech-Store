import { describe, expect, it, vi } from "vitest";

import { createTestAuthenticatedUser } from "../../../testing";
import { COUPON_STATUSES, DISCOUNT_TYPES } from "../constants";

import { CouponService } from "./coupon.service";

import type { AuthenticatedUser } from "../../../auth";
import type { CartCouponSnapshot, CartSnapshotProvider } from "../interfaces";
import type {
  CouponRepository,
  ProductCategoryFacts,
  ProductCategoryLookupRepository,
} from "../repository";
import type { Coupon, CouponRedemption } from "../types";

function buildCoupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: "coupon-1",
    code: "SAVE10",
    description: null,
    discountType: DISCOUNT_TYPES.PERCENTAGE,
    discountValue: 10,
    currency: "BDT",
    maxDiscountAmount: null,
    minOrderAmount: null,
    status: COUPON_STATUSES.ACTIVE,
    startsAt: null,
    expiresAt: null,
    usageLimit: null,
    usageLimitPerUser: null,
    usageCount: 0,
    stackable: false,
    eligibleUserIds: null,
    eligibleProductIds: null,
    eligibleCategoryIds: null,
    eligibleBrandIds: null,
    deletedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildRedemption(overrides: Partial<CouponRedemption> = {}): CouponRedemption {
  return {
    id: "redemption-1",
    couponId: "coupon-1",
    userId: "user-1",
    cartId: "cart-1",
    discountAmount: 500,
    currency: "BDT",
    stackable: false,
    removedAt: null,
    createdAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildCouponRepository(overrides: Partial<CouponRepository> = {}): CouponRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByCode: vi.fn().mockResolvedValue(null),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
    countUserRedemptions: vi.fn().mockResolvedValue(0),
    findActiveRedemption: vi.fn().mockResolvedValue(null),
    findActiveRedemptionsForCart: vi.fn().mockResolvedValue([]),
    applyRedemption: vi.fn(),
    removeRedemption: vi.fn(),
    ...overrides,
  };
}

function buildCartSnapshot(overrides: Partial<CartCouponSnapshot> = {}): CartCouponSnapshot {
  return {
    id: "cart-1",
    currency: "BDT",
    total: 5000,
    productIds: ["product-1"],
    ...overrides,
  };
}

function buildCartSnapshotProvider(
  overrides: Partial<CartSnapshotProvider> = {},
): CartSnapshotProvider {
  return {
    getOwnedCartSnapshot: vi.fn().mockResolvedValue(buildCartSnapshot()),
    ...overrides,
  };
}

function buildProductCategoryLookup(
  overrides: Partial<ProductCategoryLookupRepository> = {},
): ProductCategoryLookupRepository {
  return {
    findManyByIds: vi.fn().mockImplementation(async (ids: string[]) => {
      const map = new Map<string, ProductCategoryFacts>();
      for (const id of ids) {
        map.set(id, { categoryId: null, brandId: null });
      }
      return map;
    }),
    ...overrides,
  };
}

const ACTOR: AuthenticatedUser = createTestAuthenticatedUser({ id: "user-1" });

function buildService(
  overrides: {
    couponRepository?: Partial<CouponRepository>;
    cartSnapshot?: Partial<CartSnapshotProvider>;
    productCategoryLookup?: Partial<ProductCategoryLookupRepository>;
  } = {},
): CouponService {
  return new CouponService(
    buildCouponRepository(overrides.couponRepository),
    buildCartSnapshotProvider(overrides.cartSnapshot),
    buildProductCategoryLookup(overrides.productCategoryLookup),
  );
}

describe("CouponService", () => {
  describe("validate", () => {
    it("reports a coupon that does not exist as not found", async () => {
      const service = buildService();
      const result = await service.validate({ code: "MISSING" }, ACTOR);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("not_found");
      expect(result.discountAmount).toBeNull();
    });

    it("rejects an inactive coupon", async () => {
      const coupon = buildCoupon({ status: COUPON_STATUSES.PAUSED });
      const service = buildService({
        couponRepository: { findByCode: vi.fn().mockResolvedValue(coupon) },
      });

      const result = await service.validate({ code: "SAVE10" }, ACTOR);
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("inactive");
    });

    it("rejects a coupon whose minimum order amount is not met", async () => {
      const coupon = buildCoupon({ minOrderAmount: 10_000 });
      const service = buildService({
        couponRepository: { findByCode: vi.fn().mockResolvedValue(coupon) },
        cartSnapshot: {
          getOwnedCartSnapshot: vi.fn().mockResolvedValue(buildCartSnapshot({ total: 5000 })),
        },
      });

      const result = await service.validate({ code: "SAVE10" }, ACTOR);
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("min_order_amount_not_met");
    });

    it("rejects a coupon whose currency does not match the cart", async () => {
      const coupon = buildCoupon({ currency: "USD" });
      const service = buildService({
        couponRepository: { findByCode: vi.fn().mockResolvedValue(coupon) },
      });

      const result = await service.validate({ code: "SAVE10" }, ACTOR);
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("currency_mismatch");
    });

    it("rejects a coupon restricted to other users", async () => {
      const coupon = buildCoupon({ eligibleUserIds: ["someone-else"] });
      const service = buildService({
        couponRepository: { findByCode: vi.fn().mockResolvedValue(coupon) },
      });

      const result = await service.validate({ code: "SAVE10" }, ACTOR);
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("not_eligible");
    });

    it("rejects a coupon once the caller has exhausted their per-user limit", async () => {
      const coupon = buildCoupon({ usageLimitPerUser: 1 });
      const service = buildService({
        couponRepository: {
          findByCode: vi.fn().mockResolvedValue(coupon),
          countUserRedemptions: vi.fn().mockResolvedValue(1),
        },
      });

      const result = await service.validate({ code: "SAVE10" }, ACTOR);
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("user_usage_limit_reached");
    });

    it("computes a safe percentage discount capped at the order amount", async () => {
      const coupon = buildCoupon({
        discountType: DISCOUNT_TYPES.PERCENTAGE,
        discountValue: 200,
      });
      const service = buildService({
        couponRepository: { findByCode: vi.fn().mockResolvedValue(coupon) },
        cartSnapshot: {
          getOwnedCartSnapshot: vi.fn().mockResolvedValue(buildCartSnapshot({ total: 5000 })),
        },
      });

      const result = await service.validate({ code: "SAVE10" }, ACTOR);
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(5000);
    });

    it("caps a percentage discount at maxDiscountAmount", async () => {
      const coupon = buildCoupon({
        discountType: DISCOUNT_TYPES.PERCENTAGE,
        discountValue: 50,
        maxDiscountAmount: 1000,
      });
      const service = buildService({
        couponRepository: { findByCode: vi.fn().mockResolvedValue(coupon) },
        cartSnapshot: {
          getOwnedCartSnapshot: vi.fn().mockResolvedValue(buildCartSnapshot({ total: 5000 })),
        },
      });

      const result = await service.validate({ code: "SAVE10" }, ACTOR);
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(1000);
    });
  });

  describe("apply", () => {
    it("rejects applying an invalid coupon", async () => {
      const service = buildService();

      await expect(service.apply({ code: "MISSING" }, ACTOR)).rejects.toThrow(/not found/i);
    });

    it("prevents applying the same coupon twice to the same cart", async () => {
      const coupon = buildCoupon();
      const service = buildService({
        couponRepository: {
          findByCode: vi.fn().mockResolvedValue(coupon),
          findActiveRedemption: vi.fn().mockResolvedValue(buildRedemption()),
        },
      });

      await expect(service.apply({ code: "SAVE10" }, ACTOR)).rejects.toThrow(/already applied/i);
    });

    it("rejects a non-stackable coupon when another coupon is already applied", async () => {
      const coupon = buildCoupon({ stackable: false });
      const service = buildService({
        couponRepository: {
          findByCode: vi.fn().mockResolvedValue(coupon),
          findActiveRedemptionsForCart: vi
            .fn()
            .mockResolvedValue([buildRedemption({ couponId: "coupon-2", stackable: true })]),
        },
      });

      await expect(service.apply({ code: "SAVE10" }, ACTOR)).rejects.toThrow(/cannot be combined/i);
    });

    it("atomically records usage and creates a redemption on success", async () => {
      const coupon = buildCoupon();
      const applyRedemption = vi.fn().mockResolvedValue({
        coupon: { ...coupon, usageCount: 1 },
        redemption: buildRedemption({ discountAmount: 500 }),
      });
      const service = buildService({
        couponRepository: {
          findByCode: vi.fn().mockResolvedValue(coupon),
          applyRedemption,
        },
      });

      const result = await service.apply({ code: "SAVE10" }, ACTOR);

      expect(applyRedemption).toHaveBeenCalledWith(
        expect.objectContaining({ couponId: "coupon-1", userId: "user-1", cartId: "cart-1" }),
      );
      expect(result.coupon.usageCount).toBe(1);
      expect(result.discountAmount).toBe(500);
    });
  });

  describe("removeFromCart", () => {
    it("throws when the coupon is not applied to the caller's cart", async () => {
      const coupon = buildCoupon();
      const service = buildService({
        couponRepository: { findByCode: vi.fn().mockResolvedValue(coupon) },
      });

      await expect(service.removeFromCart("SAVE10", ACTOR)).rejects.toThrow(/not applied/i);
    });

    it("soft-removes the active redemption without decrementing usage", async () => {
      const coupon = buildCoupon();
      const removeRedemption = vi.fn().mockResolvedValue(undefined);
      const service = buildService({
        couponRepository: {
          findByCode: vi.fn().mockResolvedValue(coupon),
          findActiveRedemption: vi.fn().mockResolvedValue(buildRedemption({ id: "redemption-9" })),
          removeRedemption,
        },
      });

      await service.removeFromCart("SAVE10", ACTOR);
      expect(removeRedemption).toHaveBeenCalledWith("redemption-9");
    });
  });

  describe("delete/restore", () => {
    it("throws when deleting a coupon that does not exist", async () => {
      const service = buildService();
      await expect(service.delete("missing", ACTOR)).rejects.toThrow(/not found/i);
    });

    it("rejects restoring a coupon that is not deleted", async () => {
      const coupon = buildCoupon({ deletedAt: null });
      const service = buildService({
        couponRepository: { findById: vi.fn().mockResolvedValue(coupon) },
      });

      await expect(service.restore("coupon-1", ACTOR)).rejects.toThrow(/not deleted/i);
    });

    it("restores a soft-deleted coupon", async () => {
      const deleted = buildCoupon({ deletedAt: new Date("2026-01-02") });
      const restored = buildCoupon({ deletedAt: null });
      const findById = vi.fn().mockResolvedValueOnce(deleted).mockResolvedValueOnce(restored);
      const restore = vi.fn().mockResolvedValue(undefined);
      const service = buildService({
        couponRepository: { findById, restore },
      });

      const result = await service.restore("coupon-1", ACTOR);
      expect(restore).toHaveBeenCalledWith("coupon-1");
      expect(result.id).toBe("coupon-1");
    });
  });
});
