import { reviewMapper } from "../../review";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type {
  ModerateReviewDto,
  ReviewFilterOptions,
  ReviewResponseDto,
  ReviewService,
} from "../../review";
import type { AdminReviewRepository } from "../repository";

/**
 * Administrative review moderation. `list` reads through
 * `AdminReviewRepository` (the one unscoped, cross-product listing
 * capability `modules/review` doesn't expose). Every other operation
 * delegates outright to `modules/review`'s own `ReviewService` — its
 * `getById`/`delete`/`restore` already grant a `review:moderate` caller
 * full visibility/access (see that service's `isVisibleToActor`/
 * `getReviewForModerationOrOwner`), and `moderate` *is* the moderation
 * workflow (status change + rating-summary recalculation, transactional
 * — see `ReviewPrismaRepository`). This service never mutates a
 * `Review` row itself.
 */
export class AdminReviewService {
  constructor(
    private readonly adminReviewRepository: AdminReviewRepository,
    private readonly reviewService: ReviewService,
  ) {}

  async list(
    query: ParsedQuery,
    filters: ReviewFilterOptions,
  ): Promise<PaginatedResult<ReviewResponseDto>> {
    const result = await this.adminReviewRepository.findAll(query, filters);
    return { items: reviewMapper.toResponseList(result.items), meta: result.meta };
  }

  async getById(id: string, actor: AuthenticatedUser): Promise<ReviewResponseDto> {
    return this.reviewService.getById(id, actor);
  }

  async moderate(
    id: string,
    dto: ModerateReviewDto,
    actor: AuthenticatedUser,
  ): Promise<ReviewResponseDto> {
    return this.reviewService.moderate(id, dto, actor);
  }

  async delete(id: string, actor: AuthenticatedUser): Promise<void> {
    return this.reviewService.delete(id, actor);
  }

  async restore(id: string, actor: AuthenticatedUser): Promise<ReviewResponseDto> {
    return this.reviewService.restore(id, actor);
  }
}
