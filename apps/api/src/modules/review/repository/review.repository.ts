import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { ModerationStatus } from "../constants";
import type { ReviewFilterOptions } from "../interfaces";
import type { CreateReviewInput, Review, ReviewSummary, UpdateReviewInput } from "../types";

/**
 * Persistence contract for the Review domain entity. The service
 * depends on this interface, never on a concrete implementation
 * directly, so swapping `ReviewPrismaRepository` for a test double (or a
 * different persistence layer entirely) never touches service code.
 * `updateModerationStatus` and `incrementVote` are kept separate from
 * `update` since they represent moderation/voting bookkeeping, not an
 * author-initiated edit to the review's own content.
 */
export interface ReviewRepository {
  findById(id: string): Promise<Review | null>;
  findByProductId(
    productId: string,
    query: ParsedQuery,
    filters?: ReviewFilterOptions,
  ): Promise<PaginatedResult<Review>>;
  findByUserId(userId: string, query: ParsedQuery): Promise<PaginatedResult<Review>>;
  findByUserAndProduct(userId: string, productId: string): Promise<Review | null>;
  create(data: CreateReviewInput): Promise<Review>;
  update(id: string, data: UpdateReviewInput): Promise<Review>;
  updateModerationStatus(id: string, status: ModerationStatus): Promise<Review>;
  incrementVote(id: string, helpful: boolean): Promise<Review>;
  getSummaryByProductId(productId: string): Promise<ReviewSummary>;
}
