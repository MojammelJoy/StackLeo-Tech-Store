import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { ModerationStatus } from "../constants";
import type { ReviewFilterOptions } from "../interfaces";
import type { CreateReviewInput, Review, ReviewSummary, UpdateReviewInput } from "../types";

/** Read options every single-review lookup accepts — `includeDeleted` is
 * only ever honored for the review's own author or a `review:moderate`
 * caller (see `service/review.service.ts`), never taken at face value
 * from a request, mirroring `modules/brand`'s `BrandLookupOptions`. */
export interface ReviewLookupOptions {
  includeDeleted?: boolean;
}

/**
 * Persistence contract for the Review domain entity. The service
 * depends on this interface, never on a concrete implementation
 * directly, so swapping `ReviewPrismaRepository` for a test double (or a
 * different persistence layer entirely) never touches service code.
 *
 * `updateModerationStatus` is kept separate from `update` since it
 * represents moderator bookkeeping, not an author-initiated edit to the
 * review's own content. `castVote` replaces the foundation skeleton's
 * `incrementVote`: a bare increment has no per-user vote tracking, so
 * nothing would stop one caller from inflating `helpfulCount` by calling
 * it repeatedly — `castVote` is backed by a `ReviewHelpfulVote` ledger
 * row per `(reviewId, userId)` instead (see its Prisma implementation).
 * Every write that can change a product's visible rating set
 * (`create`/`update`/`softDelete`/`restore`/`updateModerationStatus`)
 * recalculates `ReviewRatingSummary` inside the same `$transaction` —
 * "automatically update product rating statistics".
 */
export interface ReviewRepository {
  findById(id: string, options?: ReviewLookupOptions): Promise<Review | null>;
  findByProductId(
    productId: string,
    query: ParsedQuery,
    filters?: ReviewFilterOptions,
  ): Promise<PaginatedResult<Review>>;
  /** Always the full self-view (every moderation status, non-deleted) —
   * "list user reviews" is inherently self-service in this API, so there
   * is no visibility scoping to apply here. */
  findByUserId(userId: string, query: ParsedQuery): Promise<PaginatedResult<Review>>;
  findByUserAndProduct(
    userId: string,
    productId: string,
    options?: ReviewLookupOptions,
  ): Promise<Review | null>;
  create(data: CreateReviewInput): Promise<Review>;
  update(id: string, data: UpdateReviewInput): Promise<Review>;
  /** Soft delete — sets `deletedAt`, never removes the row. */
  softDelete(id: string): Promise<void>;
  /** Reverses `softDelete` — clears `deletedAt`. */
  restore(id: string): Promise<void>;
  updateModerationStatus(id: string, status: ModerationStatus): Promise<Review>;
  /** Atomically records/changes/no-ops `userId`'s helpful/unhelpful vote
   * on `reviewId` and adjusts `helpfulCount`/`unhelpfulCount` to match —
   * see the Prisma implementation's doc comment for the three cases. */
  castVote(reviewId: string, userId: string, helpful: boolean): Promise<Review>;
  /** The cached `ReviewRatingSummary` for `productId` — a zeroed summary
   * (never `null`) when the product has no reviews yet. */
  getSummaryByProductId(productId: string): Promise<ReviewSummary>;
}
