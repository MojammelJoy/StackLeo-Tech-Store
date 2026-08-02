import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { MEDIA_STATUSES } from "../constants";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { MediaOwnerType, MediaPurpose, MediaStatus, StorageProviderName } from "../constants";
import type { MediaFilterOptions } from "../interfaces";
import type { CreateMediaAssetInput, MediaAsset, UpdateMediaAssetInput } from "../types";
import type { MediaRepository } from "./media.repository";
import type { MediaAsset as PrismaMediaAsset, Prisma, PrismaClient } from "@prisma/client";

/** Prisma's generated model type stores `purpose`/`ownerType`/`provider`/
 * `status` as plain `string` (they're `String` columns, not native
 * Postgres enums — see `prisma/schema.prisma`'s doc comment on
 * `MediaAsset`, which mirrors `Product`/`Category`/`Brand`/
 * `InventoryItem`). This is the one place that narrows them back to
 * this module's literal unions: every row only ever got there through a
 * Zod-validated DTO, so the cast is safe. */
function toDomainAsset(row: PrismaMediaAsset): MediaAsset {
  return {
    ...row,
    provider: row.provider as StorageProviderName,
    purpose: row.purpose as MediaPurpose,
    ownerType: row.ownerType as MediaOwnerType | null,
    status: row.status as MediaStatus,
  };
}

function toDomainAssetList(rows: PrismaMediaAsset[]): MediaAsset[] {
  return rows.map(toDomainAsset);
}

/**
 * Prisma-backed implementation of `MediaRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class MediaPrismaRepository implements MediaRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<MediaAsset | null> {
    const row = await this.prismaClient.mediaAsset.findUnique({ where: { id } });
    return row ? toDomainAsset(row) : null;
  }

  async findByOwner(
    ownerType: MediaOwnerType,
    ownerId: string,
    purpose?: MediaPurpose,
  ): Promise<MediaAsset[]> {
    const rows = await this.prismaClient.mediaAsset.findMany({
      where: { ownerType, ownerId, ...(purpose ? { purpose } : {}) },
      orderBy: { createdAt: "desc" },
    });
    return toDomainAssetList(rows);
  }

  async findAll(
    query: ParsedQuery,
    filters: MediaFilterOptions = {},
  ): Promise<PaginatedResult<MediaAsset>> {
    const where = buildWhere(filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.mediaAsset.findMany({ where, orderBy, skip, take }),
      this.prismaClient.mediaAsset.count({ where }),
    ]);

    return {
      items: toDomainAssetList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async create(data: CreateMediaAssetInput): Promise<MediaAsset> {
    const row = await this.prismaClient.mediaAsset.create({
      data: {
        fileName: data.fileName,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        url: data.url,
        provider: data.provider,
        providerRef: data.providerRef,
        purpose: data.purpose,
        ownerType: data.ownerType ?? null,
        ownerId: data.ownerId ?? null,
        altText: data.altText ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        durationSeconds: data.durationSeconds ?? null,
        status: data.status ?? MEDIA_STATUSES.PENDING,
      },
    });
    return toDomainAsset(row);
  }

  async update(id: string, data: UpdateMediaAssetInput): Promise<MediaAsset> {
    const row = await this.prismaClient.mediaAsset.update({
      where: { id },
      data: {
        altText: data.altText,
        status: data.status,
      },
    });
    return toDomainAsset(row);
  }

  async delete(id: string): Promise<void> {
    await this.prismaClient.mediaAsset.delete({ where: { id } });
  }
}

function buildWhere(filters: MediaFilterOptions, search?: string): Prisma.MediaAssetWhereInput {
  const conditions: Prisma.MediaAssetWhereInput[] = [];

  if (filters.purpose) {
    conditions.push({ purpose: filters.purpose });
  }
  if (filters.ownerType) {
    conditions.push({ ownerType: filters.ownerType });
  }
  if (filters.ownerId) {
    conditions.push({ ownerId: filters.ownerId });
  }
  if (filters.status) {
    conditions.push({ status: filters.status });
  }
  if (filters.provider) {
    conditions.push({ provider: filters.provider });
  }

  if (search) {
    conditions.push({ fileName: { contains: search, mode: "insensitive" } });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

/** Always appends an `id` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring
 * `modules/product`/`modules/category`/`modules/brand`/
 * `modules/inventory`. */
function buildOrderBy(sort: SortParam[]): Prisma.MediaAssetOrderByWithRelationInput[] {
  if (sort.length === 0) {
    return [{ createdAt: "desc" }, { id: "asc" }];
  }
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
