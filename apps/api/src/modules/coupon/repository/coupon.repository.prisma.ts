import { Prisma } from "@prisma/client";

import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { COUPON_STATUSES } from "../constants";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { CouponStatus, CurrencyCode, DiscountType } from "../constants";
import type { CouponFilterOptions } from "../interfaces";
import type {
  CreateCouponInput,
  Coupon,
  CouponRedemption,
  CreateCouponRedemptionInput,
  UpdateCouponInput,
} from "../types";
import type { CouponLookupOptions, CouponRepository } from "./coupon.repository";
import type {
  Coupon as PrismaCoupon,
  CouponRedemption as PrismaCouponRedemption,
  PrismaClient,
} from "@prisma/client";

/** Prisma's generated model type stores `discountType`/`status`/
 * `currency` as plain `string` (they're `String` columns, not native
 * Postgres enums — see `prisma/schema.prisma`'s doc comment on
 * `Coupon`, which mirrors `Product`/`Payment`). The four `eligible*Ids`
 * columns come back as `Prisma.JsonValue` (`string | number | boolean |
 * JsonObject | JsonArray | null`); every row only ever got there through
 * this repository writing either `null` or a `string[]`, so the cast
 * back is safe. */
function toDomainCoupon(row: PrismaCoupon): Coupon {
  return {
    ...row,
    discountType: row.discountType as DiscountType,
    currency: row.currency as CurrencyCode,
    status: row.status as CouponStatus,
    eligibleUserIds: row.eligibleUserIds as unknown as string[] | null,
    eligibleProductIds: row.eligibleProductIds as unknown as string[] | null,
    eligibleCategoryIds: row.eligibleCategoryIds as unknown as string[] | null,
    eligibleBrandIds: row.eligibleBrandIds as unknown as string[] | null,
  };
}

function toDomainCouponList(rows: PrismaCoupon[]): Coupon[] {
  return rows.map(toDomainCoupon);
}

function toDomainRedemption(
  row: PrismaCouponRedemption & { coupon: { stackable: boolean } },
): CouponRedemption {
  return {
    id: row.id,
    couponId: row.couponId,
    userId: row.userId,
    cartId: row.cartId,
    discountAmount: row.discountAmount,
    currency: row.currency as CurrencyCode,
    stackable: row.coupon.stackable,
    removedAt: row.removedAt,
    createdAt: row.createdAt,
  };
}

/** `data.eligible*Ids === null` must persist as an explicit `Json` null
 * (open to all), distinct from `undefined` (field left untouched on
 * `update`) — Prisma requires the `Prisma.JsonNull` marker to write that
 * rather than a bare `null` literal for a nullable `Json` column. */
function toEligibilityJsonInput(
  ids: string[] | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (ids === undefined) {
    return undefined;
  }
  if (ids === null) {
    return Prisma.JsonNull;
  }
  return ids as Prisma.InputJsonValue;
}

/**
 * Prisma-backed implementation of `CouponRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class CouponPrismaRepository implements CouponRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string, options: CouponLookupOptions = {}): Promise<Coupon | null> {
    const row = await this.prismaClient.coupon.findUnique({ where: { id } });
    if (!row || (row.deletedAt && !options.includeDeleted)) {
      return null;
    }
    return toDomainCoupon(row);
  }

  async findByCode(code: string, options: CouponLookupOptions = {}): Promise<Coupon | null> {
    const row = await this.prismaClient.coupon.findUnique({ where: { code } });
    if (!row || (row.deletedAt && !options.includeDeleted)) {
      return null;
    }
    return toDomainCoupon(row);
  }

  async findAll(
    query: ParsedQuery,
    filters: CouponFilterOptions = {},
  ): Promise<PaginatedResult<Coupon>> {
    const where = buildWhere(filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.coupon.findMany({ where, orderBy, skip, take }),
      this.prismaClient.coupon.count({ where }),
    ]);

    return {
      items: toDomainCouponList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async create(data: CreateCouponInput): Promise<Coupon> {
    const row = await this.prismaClient.coupon.create({
      data: {
        code: data.code,
        description: data.description ?? null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        currency: data.currency,
        maxDiscountAmount: data.maxDiscountAmount ?? null,
        minOrderAmount: data.minOrderAmount ?? null,
        status: data.status ?? COUPON_STATUSES.DRAFT,
        startsAt: data.startsAt ?? null,
        expiresAt: data.expiresAt ?? null,
        usageLimit: data.usageLimit ?? null,
        usageLimitPerUser: data.usageLimitPerUser ?? null,
        stackable: data.stackable ?? false,
        eligibleUserIds: toEligibilityJsonInput(data.eligibleUserIds ?? null),
        eligibleProductIds: toEligibilityJsonInput(data.eligibleProductIds ?? null),
        eligibleCategoryIds: toEligibilityJsonInput(data.eligibleCategoryIds ?? null),
        eligibleBrandIds: toEligibilityJsonInput(data.eligibleBrandIds ?? null),
      },
    });
    return toDomainCoupon(row);
  }

  async update(id: string, data: UpdateCouponInput): Promise<Coupon> {
    const row = await this.prismaClient.coupon.update({
      where: { id },
      data: {
        description: data.description,
        status: data.status,
        startsAt: data.startsAt,
        expiresAt: data.expiresAt,
        usageLimit: data.usageLimit,
        usageLimitPerUser: data.usageLimitPerUser,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        stackable: data.stackable,
        eligibleUserIds: toEligibilityJsonInput(data.eligibleUserIds),
        eligibleProductIds: toEligibilityJsonInput(data.eligibleProductIds),
        eligibleCategoryIds: toEligibilityJsonInput(data.eligibleCategoryIds),
        eligibleBrandIds: toEligibilityJsonInput(data.eligibleBrandIds),
      },
    });
    return toDomainCoupon(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.prismaClient.coupon.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string): Promise<void> {
    await this.prismaClient.coupon.update({ where: { id }, data: { deletedAt: null } });
  }

  async countUserRedemptions(couponId: string, userId: string): Promise<number> {
    return this.prismaClient.couponRedemption.count({ where: { couponId, userId } });
  }

  async findActiveRedemption(cartId: string, couponId: string): Promise<CouponRedemption | null> {
    const row = await this.prismaClient.couponRedemption.findFirst({
      where: { cartId, couponId, removedAt: null },
      include: { coupon: { select: { stackable: true } } },
    });
    return row ? toDomainRedemption(row) : null;
  }

  async findActiveRedemptionsForCart(cartId: string): Promise<CouponRedemption[]> {
    const rows = await this.prismaClient.couponRedemption.findMany({
      where: { cartId, removedAt: null },
      include: { coupon: { select: { stackable: true } } },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toDomainRedemption);
  }

  /** Runs the `Coupon.usageCount` increment and the `CouponRedemption`
   * insert inside one `$transaction` — "use Prisma transactions where
   * appropriate": these two writes must never be observed independently
   * (a usage count with no redemption row explaining it, or a redemption
   * row that never actually counted against the coupon's limit),
   * mirroring `modules/payment`'s `recordOutcome`. */
  async applyRedemption(
    data: CreateCouponRedemptionInput,
  ): Promise<{ coupon: Coupon; redemption: CouponRedemption }> {
    const [couponRow, redemptionRow] = await this.prismaClient.$transaction(async (tx) => {
      const coupon = await tx.coupon.update({
        where: { id: data.couponId },
        data: { usageCount: { increment: 1 } },
      });
      const redemption = await tx.couponRedemption.create({
        data: {
          couponId: data.couponId,
          userId: data.userId,
          cartId: data.cartId,
          discountAmount: data.discountAmount,
          currency: data.currency,
        },
        include: { coupon: { select: { stackable: true } } },
      });
      return [coupon, redemption] as const;
    });

    return { coupon: toDomainCoupon(couponRow), redemption: toDomainRedemption(redemptionRow) };
  }

  async removeRedemption(id: string): Promise<void> {
    await this.prismaClient.couponRedemption.update({
      where: { id },
      data: { removedAt: new Date() },
    });
  }
}

function buildWhere(filters: CouponFilterOptions, search?: string): Prisma.CouponWhereInput {
  const conditions: Prisma.CouponWhereInput[] = [{ deletedAt: null }];

  if (filters.status) {
    conditions.push({ status: filters.status });
  }
  if (filters.discountType) {
    conditions.push({ discountType: filters.discountType });
  }
  if (filters.stackable !== undefined) {
    conditions.push({ stackable: filters.stackable });
  }

  if (search) {
    conditions.push({
      OR: [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  return { AND: conditions };
}

/** Always appends an `id` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring every other
 * module's Prisma repository. */
function buildOrderBy(sort: SortParam[]): Prisma.CouponOrderByWithRelationInput[] {
  if (sort.length === 0) {
    return [{ createdAt: "desc" }, { id: "asc" }];
  }
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
