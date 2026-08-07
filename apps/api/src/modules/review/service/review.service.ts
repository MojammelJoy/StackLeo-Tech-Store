import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";
import { PERMISSIONS, userHasPermission } from "../../rbac";
import { reviewMapper } from "../mapper";
import { getDefaultModerationStatus, isVisible } from "../utils";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { ModerationStatus } from "../constants";
import type {
  CreateReviewDto,
  ModerateReviewDto,
  RatingSummaryResponseDto,
  ReviewResponseDto,
  UpdateReviewDto,
  VoteHelpfulDto,
} from "../dto";
import type { ReviewFilterOptions } from "../interfaces";
import type {
  ProductExistenceRepository,
  ReviewLookupOptions,
  ReviewRepository,
  VerifiedPurchaseLookupRepository,
} from "../repository";
import type { Review } from "../types";

/**
 * Implements every Review API operation: authoring (create/update/soft
 * delete/restore, ownership-enforced), moderation (staff-only status
 * changes and full-visibility listing, gated by `review:moderate`),
 * helpful voting, and rating aggregates — enforcing "one review per
 * product per user", product existence, and verified purchase before
 * ever letting a review be created. Depends on `ReviewRepository`
 * (interface only; see `repository/`), `ProductExistenceRepository`, and
 * `VerifiedPurchaseLookupRepository` (both direct, read-only lookups
 * against tables `modules/product`/`modules/order` own, never those
 * modules' TypeScript code) — never Prisma directly.
 *
 * This module's `moderation/` `ModerationProvider` registry
 * (automated/manual *screening strategies*) is deliberately never
 * wired in here: `AutomatedModerationProvider` is out of scope per this
 * API's "DO NOT implement AI review moderation" constraint, and
 * `ManualModerationProvider` models an async human-review *queue*
 * integration, not the synchronous admin action this service actually
 * implements (`moderate`, below) — a real moderator directly setting
 * `moderationStatus` through an authenticated, permission-gated
 * endpoint. Newly-created reviews start at `getDefaultModerationStatus()`
 * instead (prod: held for review; dev/test: immediately visible).
 *
 * Every method takes a real `actor: AuthenticatedUser` — this module is
 * authenticated-users-only end to end, mirroring `modules/payment`'s "no
 * guest/public path at all".
 */
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly productExistence: ProductExistenceRepository,
    private readonly verifiedPurchaseLookup: VerifiedPurchaseLookupRepository,
  ) {}

  async getById(id: string, actor: AuthenticatedUser): Promise<ReviewResponseDto> {
    const canModerate = this.canModerate(actor);
    const review = await this.reviewRepository.findById(id, { includeDeleted: canModerate });
    if (!review || !this.isVisibleToActor(review, actor, canModerate)) {
      throw new NotFoundError("Review not found");
    }
    return reviewMapper.toResponseDto(review);
  }

  /** "List product reviews" — a caller without `review:moderate` sees
   * only `APPROVED` reviews plus their own (any status); a moderator
   * sees every status, matching whatever `filters` they passed. */
  async listForProduct(
    productId: string,
    query: ParsedQuery,
    filters: ReviewFilterOptions,
    actor: AuthenticatedUser,
  ): Promise<PaginatedResult<ReviewResponseDto>> {
    const scopedFilters = this.canModerate(actor)
      ? filters
      : { ...filters, visibleToUserId: actor.id };
    const result = await this.reviewRepository.findByProductId(productId, query, scopedFilters);
    return { items: reviewMapper.toResponseList(result.items), meta: result.meta };
  }

  /** "List user reviews" — always the caller's own, every status, no
   * visibility scoping needed (it's inherently self-service). */
  async listMine(
    actor: AuthenticatedUser,
    query: ParsedQuery,
  ): Promise<PaginatedResult<ReviewResponseDto>> {
    const result = await this.reviewRepository.findByUserId(actor.id, query);
    return { items: reviewMapper.toResponseList(result.items), meta: result.meta };
  }

  async create(dto: CreateReviewDto, actor: AuthenticatedUser): Promise<ReviewResponseDto> {
    const productExists = await this.productExistence.exists(dto.productId);
    if (!productExists) {
      throw new NotFoundError("Product not found");
    }

    const existingReview = await this.reviewRepository.findByUserAndProduct(
      actor.id,
      dto.productId,
    );
    if (existingReview) {
      throw new ConflictError("You have already reviewed this product");
    }

    const purchase = await this.verifiedPurchaseLookup.findVerifiedPurchase(
      actor.id,
      dto.productId,
    );
    if (!purchase) {
      throw new ForbiddenError(
        "Only customers who purchased and received this product may leave a review",
      );
    }

    const review = await this.reviewRepository.create({
      productId: dto.productId,
      userId: actor.id,
      rating: dto.rating,
      title: dto.title ?? null,
      body: dto.body,
      media: dto.media ?? [],
      verifiedPurchase: { ...purchase, verifiedAt: new Date() },
      moderationStatus: getDefaultModerationStatus(),
    });

    logger.info(
      { reviewId: review.id, productId: review.productId, actorId: actor.id },
      "Review created",
    );
    return reviewMapper.toResponseDto(review);
  }

  async update(
    id: string,
    dto: UpdateReviewDto,
    actor: AuthenticatedUser,
  ): Promise<ReviewResponseDto> {
    await this.getOwnedReview(id, actor);

    const updated = await this.reviewRepository.update(id, dto);
    logger.info({ reviewId: id, actorId: actor.id }, "Review updated");
    return reviewMapper.toResponseDto(updated);
  }

  async delete(id: string, actor: AuthenticatedUser): Promise<void> {
    await this.getReviewForModerationOrOwner(id, actor, { includeDeleted: false });

    await this.reviewRepository.softDelete(id);
    logger.info({ reviewId: id, actorId: actor.id }, "Review soft-deleted");
  }

  async restore(id: string, actor: AuthenticatedUser): Promise<ReviewResponseDto> {
    const existing = await this.getReviewForModerationOrOwner(id, actor, {
      includeDeleted: true,
    });
    if (!existing.deletedAt) {
      throw new ConflictError("Review is not deleted");
    }

    await this.reviewRepository.restore(id);
    const restored = await this.reviewRepository.findById(id);
    if (!restored) {
      throw new NotFoundError("Review not found");
    }

    logger.info({ reviewId: id, actorId: actor.id }, "Review restored");
    return reviewMapper.toResponseDto(restored);
  }

  /** Staff-only (enforced by `review:moderate` at the route layer — see
   * `routes/review.routes.ts` — mirroring `modules/order`'s
   * `updateStatus`, permission-gated at the route only). */
  async moderate(
    id: string,
    dto: ModerateReviewDto,
    actor: AuthenticatedUser,
  ): Promise<ReviewResponseDto> {
    const existing = await this.reviewRepository.findById(id, { includeDeleted: true });
    if (!existing) {
      throw new NotFoundError("Review not found");
    }

    const updated = await this.reviewRepository.updateModerationStatus(
      id,
      dto.status as ModerationStatus,
    );
    logger.info(
      { reviewId: id, status: dto.status, actorId: actor.id },
      "Review moderation status changed",
    );
    return reviewMapper.toResponseDto(updated);
  }

  async vote(
    id: string,
    dto: VoteHelpfulDto,
    actor: AuthenticatedUser,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundError("Review not found");
    }
    if (review.userId === actor.id) {
      throw new BadRequestError("You cannot vote on your own review");
    }
    if (!isVisible(review)) {
      throw new NotFoundError("Review not found");
    }

    const updated = await this.reviewRepository.castVote(id, actor.id, dto.helpful);
    logger.info(
      { reviewId: id, actorId: actor.id, helpful: dto.helpful },
      "Review helpful vote recorded",
    );
    return reviewMapper.toResponseDto(updated);
  }

  async getRatingSummary(productId: string): Promise<RatingSummaryResponseDto> {
    const summary = await this.reviewRepository.getSummaryByProductId(productId);
    return reviewMapper.toSummaryDto(summary);
  }

  private canModerate(actor: AuthenticatedUser): boolean {
    return userHasPermission(actor, PERMISSIONS.REVIEW_MODERATE);
  }

  private isVisibleToActor(
    review: Review,
    actor: AuthenticatedUser,
    canModerate: boolean,
  ): boolean {
    if (canModerate || review.userId === actor.id) {
      return true;
    }
    return isVisible(review) && review.deletedAt === null;
  }

  /** Content-edit ownership: the review's own author only, never staff
   * — moderators change `moderationStatus`/delete/restore, they never
   * rewrite a reviewer's content. */
  private async getOwnedReview(id: string, actor: AuthenticatedUser): Promise<Review> {
    const review = await this.reviewRepository.findById(id);
    if (!review || review.userId !== actor.id) {
      throw new NotFoundError("Review not found");
    }
    return review;
  }

  /** Delete/restore ownership: the review's own author, or a
   * `review:moderate` caller taking down/reinstating someone else's
   * review. Either mismatch is reported as `NotFoundError`, never
   * `ForbiddenError` — "hidden is indistinguishable from nonexistent",
   * the same treatment `modules/address`/`modules/cart` give a foreign
   * resource. */
  private async getReviewForModerationOrOwner(
    id: string,
    actor: AuthenticatedUser,
    options: ReviewLookupOptions,
  ): Promise<Review> {
    const review = await this.reviewRepository.findById(id, options);
    if (!review || (!this.canModerate(actor) && review.userId !== actor.id)) {
      throw new NotFoundError("Review not found");
    }
    return review;
  }
}
