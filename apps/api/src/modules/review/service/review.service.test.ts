import { describe, expect, it, vi } from "vitest";

import { createTestAuthenticatedUser, DEFAULT_TEST_ADMIN_ROLES } from "../../../testing";
import { MODERATION_STATUSES } from "../constants";

import { ReviewService } from "./review.service";

import type { AuthenticatedUser } from "../../../auth";
import type {
  ProductExistenceRepository,
  ReviewRepository,
  VerifiedPurchase,
  VerifiedPurchaseLookupRepository,
} from "../repository";
import type { Review } from "../types";

function buildReview(overrides: Partial<Review> = {}): Review {
  return {
    id: "review-1",
    productId: "product-1",
    userId: "user-1",
    rating: 5,
    title: "Great product",
    body: "Really happy with this purchase, works as expected.",
    media: [],
    verifiedPurchase: {
      orderId: "order-1",
      orderItemId: "order-item-1",
      verifiedAt: new Date("2026-01-01"),
    },
    moderationStatus: MODERATION_STATUSES.APPROVED,
    helpfulCount: 0,
    unhelpfulCount: 0,
    deletedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildReviewRepository(overrides: Partial<ReviewRepository> = {}): ReviewRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByProductId: vi.fn(),
    findByUserId: vi.fn(),
    findByUserAndProduct: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
    updateModerationStatus: vi.fn(),
    castVote: vi.fn(),
    getSummaryByProductId: vi.fn(),
    ...overrides,
  };
}

function buildProductExistence(
  overrides: Partial<ProductExistenceRepository> = {},
): ProductExistenceRepository {
  return {
    exists: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

const VERIFIED_PURCHASE: VerifiedPurchase = { orderId: "order-1", orderItemId: "order-item-1" };

function buildVerifiedPurchaseLookup(
  overrides: Partial<VerifiedPurchaseLookupRepository> = {},
): VerifiedPurchaseLookupRepository {
  return {
    findVerifiedPurchase: vi.fn().mockResolvedValue(VERIFIED_PURCHASE),
    ...overrides,
  };
}

const ACTOR: AuthenticatedUser = createTestAuthenticatedUser({ id: "user-1" });
const OTHER_USER: AuthenticatedUser = createTestAuthenticatedUser({ id: "user-3" });
const MODERATOR: AuthenticatedUser = createTestAuthenticatedUser({
  id: "moderator-1",
  roles: [...DEFAULT_TEST_ADMIN_ROLES],
});

function buildService(
  overrides: {
    reviewRepository?: Partial<ReviewRepository>;
    productExistence?: Partial<ProductExistenceRepository>;
    verifiedPurchaseLookup?: Partial<VerifiedPurchaseLookupRepository>;
  } = {},
): ReviewService {
  return new ReviewService(
    buildReviewRepository(overrides.reviewRepository),
    buildProductExistence(overrides.productExistence),
    buildVerifiedPurchaseLookup(overrides.verifiedPurchaseLookup),
  );
}

describe("ReviewService", () => {
  describe("create", () => {
    it("rejects reviewing a product that does not exist", async () => {
      const service = buildService({
        productExistence: { exists: vi.fn().mockResolvedValue(false) },
      });

      await expect(
        service.create({ productId: "missing", rating: 5, body: "Great!!" }, ACTOR),
      ).rejects.toThrow(/product not found/i);
    });

    it("rejects a second review of the same product by the same user", async () => {
      const service = buildService({
        reviewRepository: { findByUserAndProduct: vi.fn().mockResolvedValue(buildReview()) },
      });

      await expect(
        service.create({ productId: "product-1", rating: 5, body: "Great!!" }, ACTOR),
      ).rejects.toThrow(/already reviewed/i);
    });

    it("rejects a review from a user who never purchased the product", async () => {
      const service = buildService({
        verifiedPurchaseLookup: { findVerifiedPurchase: vi.fn().mockResolvedValue(null) },
      });

      await expect(
        service.create({ productId: "product-1", rating: 5, body: "Great!!" }, ACTOR),
      ).rejects.toThrow(/purchased/i);
    });

    it("creates a review with a verified-purchase reference on success", async () => {
      const create = vi.fn().mockResolvedValue(buildReview());
      const service = buildService({ reviewRepository: { create } });

      await service.create({ productId: "product-1", rating: 5, body: "Great!!" }, ACTOR);

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: "product-1",
          userId: "user-1",
          verifiedPurchase: expect.objectContaining({
            orderId: "order-1",
            orderItemId: "order-item-1",
          }),
        }),
      );
    });
  });

  describe("getById", () => {
    it("hides another user's pending review from a non-moderator", async () => {
      const pending = buildReview({
        userId: "user-2",
        moderationStatus: MODERATION_STATUSES.PENDING,
      });
      const service = buildService({
        reviewRepository: { findById: vi.fn().mockResolvedValue(pending) },
      });

      await expect(service.getById("review-1", ACTOR)).rejects.toThrow(/not found/i);
    });

    it("lets the author see their own pending review", async () => {
      const pending = buildReview({
        userId: "user-1",
        moderationStatus: MODERATION_STATUSES.PENDING,
      });
      const service = buildService({
        reviewRepository: { findById: vi.fn().mockResolvedValue(pending) },
      });

      const result = await service.getById("review-1", ACTOR);
      expect(result.id).toBe("review-1");
    });

    it("lets a moderator see any review regardless of status", async () => {
      const pending = buildReview({
        userId: "user-2",
        moderationStatus: MODERATION_STATUSES.PENDING,
      });
      const service = buildService({
        reviewRepository: { findById: vi.fn().mockResolvedValue(pending) },
      });

      const result = await service.getById("review-1", MODERATOR);
      expect(result.id).toBe("review-1");
    });
  });

  describe("update/delete ownership", () => {
    it("rejects updating a review owned by someone else", async () => {
      const foreign = buildReview({ userId: "user-2" });
      const service = buildService({
        reviewRepository: { findById: vi.fn().mockResolvedValue(foreign) },
      });

      await expect(service.update("review-1", { body: "edited" }, ACTOR)).rejects.toThrow(
        /not found/i,
      );
    });

    it("allows a moderator to delete someone else's review", async () => {
      const foreign = buildReview({ userId: "user-2" });
      const softDelete = vi.fn().mockResolvedValue(undefined);
      const service = buildService({
        reviewRepository: { findById: vi.fn().mockResolvedValue(foreign), softDelete },
      });

      await service.delete("review-1", MODERATOR);
      expect(softDelete).toHaveBeenCalledWith("review-1");
    });

    it("rejects a non-owner, non-moderator deleting a review", async () => {
      const foreign = buildReview({ userId: "user-2" });
      const service = buildService({
        reviewRepository: { findById: vi.fn().mockResolvedValue(foreign) },
      });

      await expect(service.delete("review-1", OTHER_USER)).rejects.toThrow(/not found/i);
    });
  });

  describe("restore", () => {
    it("rejects restoring a review that is not deleted", async () => {
      const review = buildReview({ deletedAt: null });
      const service = buildService({
        reviewRepository: { findById: vi.fn().mockResolvedValue(review) },
      });

      await expect(service.restore("review-1", ACTOR)).rejects.toThrow(/not deleted/i);
    });
  });

  describe("vote", () => {
    it("rejects voting on your own review", async () => {
      const own = buildReview({ userId: "user-1" });
      const service = buildService({
        reviewRepository: { findById: vi.fn().mockResolvedValue(own) },
      });

      await expect(service.vote("review-1", { helpful: true }, ACTOR)).rejects.toThrow(
        /cannot vote on your own/i,
      );
    });

    it("rejects voting on a non-visible review", async () => {
      const pending = buildReview({
        userId: "user-2",
        moderationStatus: MODERATION_STATUSES.PENDING,
      });
      const service = buildService({
        reviewRepository: { findById: vi.fn().mockResolvedValue(pending) },
      });

      await expect(service.vote("review-1", { helpful: true }, ACTOR)).rejects.toThrow(
        /not found/i,
      );
    });

    it("casts a helpful vote on someone else's visible review", async () => {
      const target = buildReview({ userId: "user-2" });
      const castVote = vi.fn().mockResolvedValue({ ...target, helpfulCount: 1 });
      const service = buildService({
        reviewRepository: { findById: vi.fn().mockResolvedValue(target), castVote },
      });

      const result = await service.vote("review-1", { helpful: true }, ACTOR);
      expect(castVote).toHaveBeenCalledWith("review-1", "user-1", true);
      expect(result.helpfulCount).toBe(1);
    });
  });

  describe("moderate", () => {
    it("throws when moderating a review that does not exist", async () => {
      const service = buildService();
      await expect(
        service.moderate("missing", { status: MODERATION_STATUSES.APPROVED }, MODERATOR),
      ).rejects.toThrow(/not found/i);
    });

    it("changes the moderation status", async () => {
      const review = buildReview({ moderationStatus: MODERATION_STATUSES.PENDING });
      const updateModerationStatus = vi
        .fn()
        .mockResolvedValue({ ...review, moderationStatus: MODERATION_STATUSES.APPROVED });
      const service = buildService({
        reviewRepository: {
          findById: vi.fn().mockResolvedValue(review),
          updateModerationStatus,
        },
      });

      const result = await service.moderate(
        "review-1",
        { status: MODERATION_STATUSES.APPROVED },
        MODERATOR,
      );
      expect(updateModerationStatus).toHaveBeenCalledWith("review-1", MODERATION_STATUSES.APPROVED);
      expect(result.moderationStatus).toBe(MODERATION_STATUSES.APPROVED);
    });
  });

  describe("listForProduct", () => {
    it("scopes a non-moderator's listing to approved-or-own", async () => {
      const findByProductId = vi.fn().mockResolvedValue({ items: [], meta: {} });
      const service = buildService({ reviewRepository: { findByProductId } });

      await service.listForProduct(
        "product-1",
        { pagination: {}, sort: [], filters: {} } as never,
        {},
        ACTOR,
      );

      expect(findByProductId).toHaveBeenCalledWith(
        "product-1",
        expect.anything(),
        expect.objectContaining({ visibleToUserId: "user-1" }),
      );
    });

    it("does not scope a moderator's listing", async () => {
      const findByProductId = vi.fn().mockResolvedValue({ items: [], meta: {} });
      const service = buildService({ reviewRepository: { findByProductId } });

      await service.listForProduct(
        "product-1",
        { pagination: {}, sort: [], filters: {} } as never,
        {},
        MODERATOR,
      );

      expect(findByProductId).toHaveBeenCalledWith("product-1", expect.anything(), {});
    });
  });
});
