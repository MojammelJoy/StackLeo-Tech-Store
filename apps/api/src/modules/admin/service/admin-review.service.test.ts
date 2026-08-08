import { describe, expect, it, vi } from "vitest";

import { AdminReviewService } from "./admin-review.service";

import type { AuthenticatedUser } from "../../../auth";
import type { Review, ReviewService } from "../../review";
import type { AdminReviewRepository } from "../repository";

function buildReview(overrides: Partial<Review> = {}): Review {
  return {
    id: "review-1",
    productId: "product-1",
    userId: "user-1",
    rating: 5,
    title: "Great",
    body: "Really happy with this purchase.",
    media: [],
    verifiedPurchase: null,
    moderationStatus: "pending",
    helpfulCount: 0,
    unhelpfulCount: 0,
    deletedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

const MODERATOR: AuthenticatedUser = { id: "admin-1", roles: ["admin"] } as AuthenticatedUser;

describe("AdminReviewService", () => {
  it("lists across every product via AdminReviewRepository (no product scoping)", async () => {
    const findAll = vi.fn().mockResolvedValue({ items: [buildReview()], meta: {} });
    const adminReviewRepository: AdminReviewRepository = { findAll };
    const service = new AdminReviewService(adminReviewRepository, {} as ReviewService);

    const result = await service.list({ pagination: {}, sort: [], filters: {} } as never, {});
    expect(findAll).toHaveBeenCalled();
    expect(result.items).toHaveLength(1);
  });

  it("delegates moderation to ReviewService.moderate outright", async () => {
    const moderate = vi.fn().mockResolvedValue({ ...buildReview(), moderationStatus: "approved" });
    const adminReviewRepository = { findAll: vi.fn() } as unknown as AdminReviewRepository;
    const reviewService = { moderate } as unknown as ReviewService;
    const service = new AdminReviewService(adminReviewRepository, reviewService);

    await service.moderate("review-1", { status: "approved" } as never, MODERATOR);
    expect(moderate).toHaveBeenCalledWith("review-1", { status: "approved" }, MODERATOR);
  });

  it("delegates delete to ReviewService.delete outright", async () => {
    const deleteFn = vi.fn().mockResolvedValue(undefined);
    const adminReviewRepository = { findAll: vi.fn() } as unknown as AdminReviewRepository;
    const reviewService = { delete: deleteFn } as unknown as ReviewService;
    const service = new AdminReviewService(adminReviewRepository, reviewService);

    await service.delete("review-1", MODERATOR);
    expect(deleteFn).toHaveBeenCalledWith("review-1", MODERATOR);
  });
});
