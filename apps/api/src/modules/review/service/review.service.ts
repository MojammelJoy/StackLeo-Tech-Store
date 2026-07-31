import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { ModerationStatus, ModerationStrategyName } from "../constants";
import type { CreateReviewDto, UpdateReviewDto, VoteHelpfulDto } from "../dto";
import type { ReviewFilterOptions } from "../interfaces";
import type { ModerationProvider } from "../moderation";
import type { ReviewRepository } from "../repository";
import type { Review, ReviewSummary } from "../types";

/**
 * Skeleton review service — the operations a concrete implementation
 * will expose once review persistence and real moderation strategies
 * exist. Depends on `ReviewRepository` (interface only; see
 * `repository/`) for persistence and a *registry* of `ModerationProvider`s
 * keyed by name — never a single hardcoded strategy — which is what
 * actually lets this foundation "support review moderation": routing a
 * new review to automated screening or a manual queue is a matter of
 * choosing a registry key, not branching logic baked into this class.
 * Every method throws `NotImplementedError` — no database operations,
 * no calls to any moderation strategy, and no business rules (how to
 * detect a duplicate review, how to confirm a verified purchase, how to
 * decide a moderation outcome) happen in this foundation.
 *
 * Write operations accept `actor: AuthenticatedUser` — the caller
 * performing the mutation — so a future concrete implementation can
 * attribute changes (audit logging, authorship) without every call
 * site's signature changing later. Nothing here checks `actor`'s
 * permissions; that is `modules/rbac`'s job, applied by whatever
 * middleware sits in front of this service once it exists.
 */
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly moderationProviders: Partial<
      Record<ModerationStrategyName, ModerationProvider>
    >,
  ) {}

  async findById(id: string): Promise<Review | null> {
    throw new NotImplementedError(`ReviewService.findById is not implemented yet (id: ${id})`);
  }

  async findByProductId(
    productId: string,
    _query: ParsedQuery,
    _filters?: ReviewFilterOptions,
  ): Promise<PaginatedResult<Review>> {
    throw new NotImplementedError(
      `ReviewService.findByProductId is not implemented yet (productId: ${productId})`,
    );
  }

  async findByUserId(userId: string, _query: ParsedQuery): Promise<PaginatedResult<Review>> {
    throw new NotImplementedError(
      `ReviewService.findByUserId is not implemented yet (userId: ${userId})`,
    );
  }

  async create(_dto: CreateReviewDto, _actor: AuthenticatedUser): Promise<Review> {
    throw new NotImplementedError("ReviewService.create is not implemented yet");
  }

  async update(id: string, _dto: UpdateReviewDto, _actor: AuthenticatedUser): Promise<Review> {
    throw new NotImplementedError(`ReviewService.update is not implemented yet (id: ${id})`);
  }

  async vote(id: string, _dto: VoteHelpfulDto, _actor: AuthenticatedUser): Promise<Review> {
    throw new NotImplementedError(`ReviewService.vote is not implemented yet (id: ${id})`);
  }

  async moderate(id: string, status: ModerationStatus, _actor: AuthenticatedUser): Promise<Review> {
    throw new NotImplementedError(
      `ReviewService.moderate is not implemented yet (id: ${id}, status: ${status})`,
    );
  }

  async getSummary(productId: string): Promise<ReviewSummary> {
    throw new NotImplementedError(
      `ReviewService.getSummary is not implemented yet (productId: ${productId})`,
    );
  }
}
