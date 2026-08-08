import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { MODERATION_STATUSES, RATING_VALUES } from "../constants";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { ModerationStatus, RatingValue } from "../constants";
import type { ReviewFilterOptions, ReviewMediaItem } from "../interfaces";
import type { CreateReviewInput, Review, ReviewSummary, UpdateReviewInput } from "../types";
import type { ReviewLookupOptions, ReviewRepository } from "./review.repository";
import type { Prisma, PrismaClient, Review as PrismaReview } from "@prisma/client";

/** Prisma's generated model type stores `moderationStatus` as a plain
 * `string` (it's a `String` column, not a native Postgres enum — see
 * `prisma/schema.prisma`'s doc comment on `Review`, which mirrors
 * `Product`/`Payment`). `verifiedOrderId`/`verifiedOrderItemId`/
 * `verifiedAt` are `null` together or set together — every row only
 * ever got there through this repository, so reconstructing
 * `VerifiedPurchaseReference` from all-three-present is safe. */
function toDomainReview(row: PrismaReview): Review {
  return {
    id: row.id,
    productId: row.productId,
    userId: row.userId,
    rating: row.rating as RatingValue,
    title: row.title,
    body: row.body,
    media: row.media as unknown as ReviewMediaItem[],
    verifiedPurchase:
      row.verifiedOrderId && row.verifiedOrderItemId && row.verifiedAt
        ? {
            orderId: row.verifiedOrderId,
            orderItemId: row.verifiedOrderItemId,
            verifiedAt: row.verifiedAt,
          }
        : null,
    moderationStatus: row.moderationStatus as ModerationStatus,
    helpfulCount: row.helpfulCount,
    unhelpfulCount: row.unhelpfulCount,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toDomainReviewList(rows: PrismaReview[]): Review[] {
  return rows.map(toDomainReview);
}

const ZERO_RATING_BREAKDOWN: Record<RatingValue, number> = {
  [RATING_VALUES.ONE]: 0,
  [RATING_VALUES.TWO]: 0,
  [RATING_VALUES.THREE]: 0,
  [RATING_VALUES.FOUR]: 0,
  [RATING_VALUES.FIVE]: 0,
};

/**
 * Recomputes `ReviewRatingSummary` for `productId` from scratch — via a
 * single `groupBy` aggregate query over that product's currently
 * `APPROVED`, non-deleted reviews — and upserts the cached row, all
 * inside the caller's `$transaction`. A full recompute rather than an
 * incremental increment/decrement: a rating *edit* moves a review
 * between two star buckets, a moderation change or soft delete/restore
 * flips whether it counts at all, and getting every one of those deltas
 * right independently is real bug surface a single aggregate query
 * sidesteps entirely — see `prisma/schema.prisma`'s `ReviewRatingSummary`
 * doc comment.
 */
async function recalculateRatingSummary(
  tx: Prisma.TransactionClient,
  productId: string,
): Promise<void> {
  const grouped = await tx.review.groupBy({
    by: ["rating"],
    where: { productId, deletedAt: null, moderationStatus: MODERATION_STATUSES.APPROVED },
    _count: { rating: true },
  });

  const counts: Record<RatingValue, number> = { ...ZERO_RATING_BREAKDOWN };
  let totalReviews = 0;
  let ratingSum = 0;
  for (const group of grouped) {
    const rating = group.rating as RatingValue;
    const count = group._count.rating;
    counts[rating] = count;
    totalReviews += count;
    ratingSum += rating * count;
  }
  const averageRating = totalReviews === 0 ? 0 : ratingSum / totalReviews;

  const countColumns = {
    rating1Count: counts[RATING_VALUES.ONE],
    rating2Count: counts[RATING_VALUES.TWO],
    rating3Count: counts[RATING_VALUES.THREE],
    rating4Count: counts[RATING_VALUES.FOUR],
    rating5Count: counts[RATING_VALUES.FIVE],
  };

  await tx.reviewRatingSummary.upsert({
    where: { productId },
    create: { productId, averageRating, totalReviews, ...countColumns },
    update: { averageRating, totalReviews, ...countColumns },
  });
}

/**
 * Prisma-backed implementation of `ReviewRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class ReviewPrismaRepository implements ReviewRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string, options: ReviewLookupOptions = {}): Promise<Review | null> {
    const row = await this.prismaClient.review.findUnique({ where: { id } });
    if (!row || (row.deletedAt && !options.includeDeleted)) {
      return null;
    }
    return toDomainReview(row);
  }

  async findByUserAndProduct(
    userId: string,
    productId: string,
    options: ReviewLookupOptions = {},
  ): Promise<Review | null> {
    const row = await this.prismaClient.review.findFirst({ where: { userId, productId } });
    if (!row || (row.deletedAt && !options.includeDeleted)) {
      return null;
    }
    return toDomainReview(row);
  }

  async findByProductId(
    productId: string,
    query: ParsedQuery,
    filters: ReviewFilterOptions = {},
  ): Promise<PaginatedResult<Review>> {
    return this.findMany({ productId }, query, filters);
  }

  async findByUserId(userId: string, query: ParsedQuery): Promise<PaginatedResult<Review>> {
    return this.findMany({ userId }, query, {});
  }

  private async findMany(
    identity: Prisma.ReviewWhereInput,
    query: ParsedQuery,
    filters: ReviewFilterOptions,
  ): Promise<PaginatedResult<Review>> {
    const where = buildWhere(identity, filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.review.findMany({ where, orderBy, skip, take }),
      this.prismaClient.review.count({ where }),
    ]);

    return {
      items: toDomainReviewList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async create(data: CreateReviewInput): Promise<Review> {
    const row = await this.prismaClient.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          productId: data.productId,
          userId: data.userId,
          rating: data.rating,
          title: data.title ?? null,
          body: data.body,
          media: (data.media ?? []) as unknown as Prisma.InputJsonValue,
          verifiedOrderId: data.verifiedPurchase?.orderId ?? null,
          verifiedOrderItemId: data.verifiedPurchase?.orderItemId ?? null,
          verifiedAt: data.verifiedPurchase?.verifiedAt ?? null,
          moderationStatus: data.moderationStatus ?? MODERATION_STATUSES.PENDING,
        },
      });
      await recalculateRatingSummary(tx, created.productId);
      return created;
    });
    return toDomainReview(row);
  }

  async update(id: string, data: UpdateReviewInput): Promise<Review> {
    const row = await this.prismaClient.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id },
        data: {
          rating: data.rating,
          title: data.title,
          body: data.body,
          media:
            data.media !== undefined ? (data.media as unknown as Prisma.InputJsonValue) : undefined,
        },
      });
      await recalculateRatingSummary(tx, updated.productId);
      return updated;
    });
    return toDomainReview(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.prismaClient.$transaction(async (tx) => {
      const updated = await tx.review.update({ where: { id }, data: { deletedAt: new Date() } });
      await recalculateRatingSummary(tx, updated.productId);
    });
  }

  async restore(id: string): Promise<void> {
    await this.prismaClient.$transaction(async (tx) => {
      const updated = await tx.review.update({ where: { id }, data: { deletedAt: null } });
      await recalculateRatingSummary(tx, updated.productId);
    });
  }

  async updateModerationStatus(id: string, status: ModerationStatus): Promise<Review> {
    const row = await this.prismaClient.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id },
        data: { moderationStatus: status },
      });
      await recalculateRatingSummary(tx, updated.productId);
      return updated;
    });
    return toDomainReview(row);
  }

  /** Three cases, all in one `$transaction` so the `ReviewHelpfulVote`
   * ledger and `Review.helpfulCount`/`unhelpfulCount` never drift apart:
   * no existing vote (insert + increment the matching counter),
   * resubmitting the same value (no-op — idempotent, not an error), and
   * switching an existing vote (update the ledger row + move one count
   * from the old counter to the new one). */
  async castVote(reviewId: string, userId: string, helpful: boolean): Promise<Review> {
    const row = await this.prismaClient.$transaction(async (tx) => {
      const existingVote = await tx.reviewHelpfulVote.findUnique({
        where: { reviewId_userId: { reviewId, userId } },
      });

      if (existingVote && existingVote.helpful === helpful) {
        return tx.review.findUniqueOrThrow({ where: { id: reviewId } });
      }

      if (existingVote) {
        await tx.reviewHelpfulVote.update({ where: { id: existingVote.id }, data: { helpful } });
        return tx.review.update({
          where: { id: reviewId },
          data: helpful
            ? { helpfulCount: { increment: 1 }, unhelpfulCount: { decrement: 1 } }
            : { helpfulCount: { decrement: 1 }, unhelpfulCount: { increment: 1 } },
        });
      }

      await tx.reviewHelpfulVote.create({ data: { reviewId, userId, helpful } });
      return tx.review.update({
        where: { id: reviewId },
        data: helpful ? { helpfulCount: { increment: 1 } } : { unhelpfulCount: { increment: 1 } },
      });
    });
    return toDomainReview(row);
  }

  async getSummaryByProductId(productId: string): Promise<ReviewSummary> {
    const row = await this.prismaClient.reviewRatingSummary.findUnique({ where: { productId } });
    if (!row) {
      return {
        productId,
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: ZERO_RATING_BREAKDOWN,
      };
    }
    return {
      productId: row.productId,
      averageRating: row.averageRating,
      totalReviews: row.totalReviews,
      ratingBreakdown: {
        [RATING_VALUES.ONE]: row.rating1Count,
        [RATING_VALUES.TWO]: row.rating2Count,
        [RATING_VALUES.THREE]: row.rating3Count,
        [RATING_VALUES.FOUR]: row.rating4Count,
        [RATING_VALUES.FIVE]: row.rating5Count,
      },
    };
  }
}

function buildWhere(
  identity: Prisma.ReviewWhereInput,
  filters: ReviewFilterOptions,
  search?: string,
): Prisma.ReviewWhereInput {
  const conditions: Prisma.ReviewWhereInput[] = [identity, { deletedAt: null }];

  if (filters.rating) {
    conditions.push({ rating: filters.rating });
  }
  if (filters.moderationStatus) {
    conditions.push({ moderationStatus: filters.moderationStatus });
  }
  if (filters.verifiedOnly) {
    conditions.push({ verifiedOrderId: { not: null } });
  }
  if (filters.visibleToUserId) {
    conditions.push({
      OR: [{ moderationStatus: MODERATION_STATUSES.APPROVED }, { userId: filters.visibleToUserId }],
    });
  }

  if (search) {
    conditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  return { AND: conditions };
}

/** Always appends an `id` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring every other
 * module's Prisma repository. */
function buildOrderBy(sort: SortParam[]): Prisma.ReviewOrderByWithRelationInput[] {
  if (sort.length === 0) {
    return [{ createdAt: "desc" }, { id: "asc" }];
  }
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
