import { Prisma } from "@prisma/client";

import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { ConflictError } from "../../../errors";
import { WISHLIST_STATUSES } from "../constants";

import type { FilterParams, PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { WishlistStatus, WishlistVisibility } from "../constants";
import type { WishlistFilterOptions } from "../interfaces";
import type {
  CreateWishlistInput,
  CreateWishlistItemInput,
  UpdateWishlistInput,
  UpdateWishlistItemInput,
  Wishlist,
  WishlistItem,
} from "../types";
import type { WishlistRepository } from "./wishlist.repository";
import type {
  Wishlist as PrismaWishlist,
  WishlistItem as PrismaWishlistItem,
  PrismaClient,
} from "@prisma/client";

/** A unique-constraint violation's Prisma error code — see
 * `addItem`'s doc comment for why this is caught here rather than left
 * to surface as a raw Prisma error. */
const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

/** Prisma's generated model type stores `status`/`visibility` as plain
 * `string` (they're `String` columns, not native Postgres enums — see
 * `prisma/schema.prisma`'s doc comment on `Wishlist`, which mirrors
 * `Cart`). This is the one place that narrows them back to this
 * module's literal unions: every row only ever got there through this
 * repository, so the cast is safe. */
function toDomainWishlist(row: PrismaWishlist): Wishlist {
  return {
    ...row,
    status: row.status as WishlistStatus,
    visibility: row.visibility as WishlistVisibility,
  };
}

function toDomainWishlistList(rows: PrismaWishlist[]): Wishlist[] {
  return rows.map(toDomainWishlist);
}

function toDomainWishlistItem(row: PrismaWishlistItem): WishlistItem {
  return { ...row };
}

function toDomainWishlistItemList(rows: PrismaWishlistItem[]): WishlistItem[] {
  return rows.map(toDomainWishlistItem);
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_VIOLATION
  );
}

/**
 * Prisma-backed implementation of `WishlistRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class WishlistPrismaRepository implements WishlistRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Wishlist | null> {
    const row = await this.prismaClient.wishlist.findUnique({ where: { id } });
    return row ? toDomainWishlist(row) : null;
  }

  async findByUserId(userId: string): Promise<Wishlist | null> {
    const row = await this.prismaClient.wishlist.findFirst({
      where: { userId, status: WISHLIST_STATUSES.ACTIVE },
      orderBy: { createdAt: "desc" },
    });
    return row ? toDomainWishlist(row) : null;
  }

  async findByGuestToken(guestToken: string): Promise<Wishlist | null> {
    const row = await this.prismaClient.wishlist.findFirst({
      where: { guestToken, status: WISHLIST_STATUSES.ACTIVE },
    });
    return row ? toDomainWishlist(row) : null;
  }

  async findByShareToken(shareToken: string): Promise<Wishlist | null> {
    const row = await this.prismaClient.wishlist.findFirst({ where: { shareToken } });
    return row ? toDomainWishlist(row) : null;
  }

  async findAll(
    query: ParsedQuery,
    filters: WishlistFilterOptions = {},
  ): Promise<PaginatedResult<Wishlist>> {
    const where = buildWishlistWhere(filters);
    const orderBy = buildWishlistOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.wishlist.findMany({ where, orderBy, skip, take }),
      this.prismaClient.wishlist.count({ where }),
    ]);

    return {
      items: toDomainWishlistList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async create(data: CreateWishlistInput): Promise<Wishlist> {
    const row = await this.prismaClient.wishlist.create({
      data: {
        userId: data.userId ?? null,
        guestToken: data.guestToken ?? null,
        status: data.status ?? WISHLIST_STATUSES.ACTIVE,
      },
    });
    return toDomainWishlist(row);
  }

  async update(id: string, data: UpdateWishlistInput): Promise<Wishlist> {
    const row = await this.prismaClient.wishlist.update({
      where: { id },
      data: { status: data.status, visibility: data.visibility, shareToken: data.shareToken },
    });
    return toDomainWishlist(row);
  }

  async delete(id: string): Promise<void> {
    await this.prismaClient.wishlist.delete({ where: { id } });
  }

  /** Wrapped in `$transaction` so the "does an active wishlist already
   * exist" read and the fallback `create` happen as one round trip
   * rather than two separate ones from the service — meaningfully
   * narrows (though, under Postgres's default `READ COMMITTED`
   * isolation, doesn't fully eliminate) the window where two concurrent
   * first-time requests from the same user could each decide to
   * create one. Full elimination would need a partial unique index
   * (`WHERE status = 'active'`) or `SERIALIZABLE` isolation — out of
   * scope here, since a duplicate *active* wishlist is a harmless,
   * self-correcting edge case (not a money- or stock-affecting one like
   * `modules/inventory`'s concurrency concern), not a correctness bug
   * worth that cost. */
  async findOrCreateActiveByUserId(userId: string): Promise<Wishlist> {
    const row = await this.prismaClient.$transaction(async (tx) => {
      const existing = await tx.wishlist.findFirst({
        where: { userId, status: WISHLIST_STATUSES.ACTIVE },
        orderBy: { createdAt: "desc" },
      });
      if (existing) {
        return existing;
      }
      return tx.wishlist.create({ data: { userId, status: WISHLIST_STATUSES.ACTIVE } });
    });
    return toDomainWishlist(row);
  }

  async findItemsByWishlistId(
    wishlistId: string,
    query: ParsedQuery,
  ): Promise<PaginatedResult<WishlistItem>> {
    const where = buildItemWhere(wishlistId, query.filters, query.search);
    const orderBy = buildItemOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.wishlistItem.findMany({ where, orderBy, skip, take }),
      this.prismaClient.wishlistItem.count({ where }),
    ]);

    return {
      items: toDomainWishlistItemList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async findAllItemsByWishlistId(wishlistId: string): Promise<WishlistItem[]> {
    const rows = await this.prismaClient.wishlistItem.findMany({
      where: { wishlistId },
      orderBy: { createdAt: "asc" },
    });
    return toDomainWishlistItemList(rows);
  }

  async findItemById(itemId: string): Promise<WishlistItem | null> {
    const row = await this.prismaClient.wishlistItem.findUnique({ where: { id: itemId } });
    return row ? toDomainWishlistItem(row) : null;
  }

  async findItemByProductId(wishlistId: string, productId: string): Promise<WishlistItem | null> {
    const row = await this.prismaClient.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId, productId } },
    });
    return row ? toDomainWishlistItem(row) : null;
  }

  /** `WishlistService.addItem` already checks for an existing
   * `(wishlistId, productId)` row before calling this — that check
   * alone can't close the race between two concurrent add requests for
   * the same product, so `@@unique([wishlistId, productId])` is the
   * actual enforcement; a violation of it here is translated to the
   * same user-facing `ConflictError` the service's own pre-check
   * raises, rather than leaking a raw Prisma error. */
  async addItem(data: CreateWishlistItemInput): Promise<WishlistItem> {
    try {
      const row = await this.prismaClient.wishlistItem.create({
        data: {
          wishlistId: data.wishlistId,
          productId: data.productId,
          sku: data.sku,
          priceAtAdd: data.priceAtAdd,
          notifyOnAvailability: data.notifyOnAvailability ?? false,
        },
      });
      return toDomainWishlistItem(row);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError("Product already exists in this wishlist");
      }
      throw error;
    }
  }

  async updateItem(itemId: string, data: UpdateWishlistItemInput): Promise<WishlistItem> {
    const row = await this.prismaClient.wishlistItem.update({
      where: { id: itemId },
      data: { notifyOnAvailability: data.notifyOnAvailability },
    });
    return toDomainWishlistItem(row);
  }

  async removeItem(itemId: string): Promise<void> {
    await this.prismaClient.wishlistItem.delete({ where: { id: itemId } });
  }
}

function buildWishlistWhere(filters: WishlistFilterOptions): Prisma.WishlistWhereInput {
  const conditions: Prisma.WishlistWhereInput[] = [];

  if (filters.userId) {
    conditions.push({ userId: filters.userId });
  }
  if (filters.status) {
    conditions.push({ status: filters.status });
  }
  if (filters.visibility) {
    conditions.push({ visibility: filters.visibility });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

/** Always appends an `id` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring every other
 * module's Prisma repository. */
function buildWishlistOrderBy(sort: SortParam[]): Prisma.WishlistOrderByWithRelationInput[] {
  if (sort.length === 0) return [{ createdAt: "desc" }, { id: "asc" }];
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}

/** `search` matches `sku` — the only free-text field a `WishlistItem`
 * carries (`productId` is an opaque id, not searchable text; the
 * product's own name lives in `modules/product`, which this module
 * never queries into for a plain items listing). */
function buildItemWhere(
  wishlistId: string,
  filters: FilterParams,
  search?: string,
): Prisma.WishlistItemWhereInput {
  const conditions: Prisma.WishlistItemWhereInput[] = [{ wishlistId }];

  const notifyOnAvailability = filters.notifyOnAvailability;
  if (notifyOnAvailability) {
    conditions.push({ notifyOnAvailability: notifyOnAvailability.value === "true" });
  }

  if (search) {
    conditions.push({ sku: { contains: search, mode: "insensitive" } });
  }

  return { AND: conditions };
}

function buildItemOrderBy(sort: SortParam[]): Prisma.WishlistItemOrderByWithRelationInput[] {
  if (sort.length === 0) return [{ createdAt: "desc" }, { id: "asc" }];
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
