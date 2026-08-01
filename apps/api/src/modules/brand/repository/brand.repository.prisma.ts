import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { BRAND_STATUSES, BRAND_VISIBILITIES } from "../constants";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { BrandStatus, BrandVisibility } from "../constants";
import type { BrandFilterOptions } from "../interfaces";
import type { Brand, CreateBrandInput, UpdateBrandInput, UpdateBrandLogoInput } from "../types";
import type { BrandLookupOptions, BrandRepository } from "./brand.repository";
import type { Brand as PrismaBrand, Prisma, PrismaClient } from "@prisma/client";

/** Prisma's generated model type stores `status`/`visibility` as plain
 * `string` (they're `String` columns, not native Postgres enums — see
 * `prisma/schema.prisma`'s doc comment on `Brand`, which mirrors
 * `Product`/`Category`). This is the one place that narrows them back
 * to this module's literal unions: every row in the table only ever got
 * there through a Zod-validated DTO, so the cast is safe. */
function toDomainBrand(row: PrismaBrand): Brand {
  return {
    ...row,
    status: row.status as BrandStatus,
    visibility: row.visibility as BrandVisibility,
  };
}

function toDomainBrandList(rows: PrismaBrand[]): Brand[] {
  return rows.map(toDomainBrand);
}

/**
 * Prisma-backed implementation of `BrandRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 *
 * No method here uses `$transaction`: unlike `modules/product`
 * (product + variants + specifications) or `modules/category`
 * (cascading soft delete/restore across a subtree), a `Brand` is a flat,
 * single-table entity with no related rows to keep in sync — every
 * operation below is already a single atomic statement.
 */
export class BrandPrismaRepository implements BrandRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string, options: BrandLookupOptions = {}): Promise<Brand | null> {
    const row = await this.prismaClient.brand.findUnique({ where: { id } });
    if (!row || (row.deletedAt && !options.includeDeleted)) {
      return null;
    }
    return toDomainBrand(row);
  }

  async findBySlug(slug: string, options: BrandLookupOptions = {}): Promise<Brand | null> {
    const row = await this.prismaClient.brand.findUnique({ where: { slug } });
    if (!row || (row.deletedAt && !options.includeDeleted)) {
      return null;
    }
    return toDomainBrand(row);
  }

  async findAll(
    query: ParsedQuery,
    filters: BrandFilterOptions = {},
  ): Promise<PaginatedResult<Brand>> {
    const where = buildWhere(filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.brand.findMany({ where, orderBy, skip, take }),
      this.prismaClient.brand.count({ where }),
    ]);

    return {
      items: toDomainBrandList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.prismaClient.brand.count({ where: { slug } });
    return count > 0;
  }

  async create(data: CreateBrandInput): Promise<Brand> {
    const row = await this.prismaClient.brand.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        websiteUrl: data.websiteUrl ?? null,
        status: data.status ?? BRAND_STATUSES.DRAFT,
        visibility: data.visibility ?? BRAND_VISIBILITIES.PUBLIC,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        seoKeywords: data.seoKeywords ?? [],
      },
    });
    return toDomainBrand(row);
  }

  async update(id: string, data: UpdateBrandInput): Promise<Brand> {
    const row = await this.prismaClient.brand.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        websiteUrl: data.websiteUrl,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
    });
    return toDomainBrand(row);
  }

  async updateStatus(id: string, status: BrandStatus): Promise<Brand> {
    const row = await this.prismaClient.brand.update({ where: { id }, data: { status } });
    return toDomainBrand(row);
  }

  async updateVisibility(id: string, visibility: BrandVisibility): Promise<Brand> {
    const row = await this.prismaClient.brand.update({ where: { id }, data: { visibility } });
    return toDomainBrand(row);
  }

  async updateLogo(id: string, data: UpdateBrandLogoInput): Promise<Brand> {
    // `data.logoAltText` is passed through as-is (not `?? undefined`):
    // `undefined` (omitted) must leave the existing alt text untouched,
    // while an explicit `null` must clear it — collapsing both to the
    // same value here would make "clear just the alt text, keep the
    // logo" impossible to express. Clearing the logo itself always
    // clears the alt text too, regardless of what was passed for it.
    const row = await this.prismaClient.brand.update({
      where: { id },
      data: {
        logoUrl: data.logoUrl,
        logoAltText: data.logoUrl === null ? null : data.logoAltText,
        logoUpdatedAt: new Date(),
      },
    });
    return toDomainBrand(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.prismaClient.brand.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string): Promise<void> {
    await this.prismaClient.brand.update({ where: { id }, data: { deletedAt: null } });
  }
}

function buildWhere(filters: BrandFilterOptions, search?: string): Prisma.BrandWhereInput {
  const conditions: Prisma.BrandWhereInput[] = [];

  if (!filters.includeDeleted) {
    conditions.push({ deletedAt: null });
  }
  if (filters.status) {
    conditions.push({ status: filters.status });
  }
  if (filters.visibility) {
    conditions.push({ visibility: filters.visibility });
  }

  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

/** Always appends an `id` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring
 * `modules/product`/`modules/category`. */
function buildOrderBy(sort: SortParam[]): Prisma.BrandOrderByWithRelationInput[] {
  if (sort.length === 0) {
    return [{ name: "asc" }, { id: "asc" }];
  }
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
