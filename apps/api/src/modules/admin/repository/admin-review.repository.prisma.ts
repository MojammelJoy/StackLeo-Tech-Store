import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";

import type { AdminReviewRepository } from "./admin-review.repository";
import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type {
  ModerationStatus,
  RatingValue,
  Review,
  ReviewFilterOptions,
  ReviewMediaItem,
} from "../../review";
import type { Prisma, PrismaClient, Review as PrismaReview } from "@prisma/client";

/** Mirrors `modules/review/repository/review.repository.prisma.ts`'s
 * private `toDomainReview` exactly (that function isn't exported — this
 * module never imports another module's internals, only its public
 * types/constants/services) — every row only ever got there through
 * that module's own repository, so the same cast back is safe here. */
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

/**
 * Prisma-backed implementation of `AdminReviewRepository`. Defaults to
 * the shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class AdminReviewPrismaRepository implements AdminReviewRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findAll(
    query: ParsedQuery,
    filters: ReviewFilterOptions = {},
  ): Promise<PaginatedResult<Review>> {
    const where = buildWhere(filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.review.findMany({ where, orderBy, skip, take }),
      this.prismaClient.review.count({ where }),
    ]);

    return {
      items: rows.map(toDomainReview),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }
}

function buildWhere(filters: ReviewFilterOptions, search?: string): Prisma.ReviewWhereInput {
  const conditions: Prisma.ReviewWhereInput[] = [{ deletedAt: null }];

  if (filters.rating) {
    conditions.push({ rating: filters.rating });
  }
  if (filters.moderationStatus) {
    conditions.push({ moderationStatus: filters.moderationStatus });
  }
  if (filters.verifiedOnly) {
    conditions.push({ verifiedOrderId: { not: null } });
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
