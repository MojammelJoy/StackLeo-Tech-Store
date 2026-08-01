import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { CATEGORY_STATUSES, CATEGORY_VISIBILITIES } from "../constants";
import { collectDescendantIds } from "../utils";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { CategoryStatus, CategoryVisibility } from "../constants";
import type { CategoryFilterOptions } from "../interfaces";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../types";
import type { CategoryLookupOptions, CategoryRepository } from "./category.repository";
import type { Category as PrismaCategory, Prisma, PrismaClient } from "@prisma/client";

/** Prisma's generated model type stores `status`/`visibility` as plain
 * `string` (they're `String` columns, not native Postgres enums — see
 * `prisma/schema.prisma`'s doc comment on `Category`, which mirrors
 * `Product`'s). This is the one place that narrows them back to this
 * module's literal unions: every row in the table only ever got there
 * through a Zod-validated DTO, so the cast is safe. */
function toDomainCategory(row: PrismaCategory): Category {
  return {
    ...row,
    status: row.status as CategoryStatus,
    visibility: row.visibility as CategoryVisibility,
  };
}

function toDomainCategoryList(rows: PrismaCategory[]): Category[] {
  return rows.map(toDomainCategory);
}

/**
 * Prisma-backed implementation of `CategoryRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class CategoryPrismaRepository implements CategoryRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string, options: CategoryLookupOptions = {}): Promise<Category | null> {
    const row = await this.prismaClient.category.findUnique({ where: { id } });
    if (!row || (row.deletedAt && !options.includeDeleted)) {
      return null;
    }
    return toDomainCategory(row);
  }

  async findBySlug(slug: string, options: CategoryLookupOptions = {}): Promise<Category | null> {
    const row = await this.prismaClient.category.findUnique({ where: { slug } });
    if (!row || (row.deletedAt && !options.includeDeleted)) {
      return null;
    }
    return toDomainCategory(row);
  }

  async findAll(
    query: ParsedQuery,
    filters: CategoryFilterOptions = {},
  ): Promise<PaginatedResult<Category>> {
    const where = buildWhere(filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.category.findMany({ where, orderBy, skip, take }),
      this.prismaClient.category.count({ where }),
    ]);

    return {
      items: toDomainCategoryList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async findChildren(
    parentId: string | null,
    options: CategoryLookupOptions = {},
  ): Promise<Category[]> {
    const rows = await this.prismaClient.category.findMany({
      where: { parentId, ...(options.includeDeleted ? {} : { deletedAt: null }) },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return toDomainCategoryList(rows);
  }

  async findManyForTree(options: CategoryLookupOptions = {}): Promise<Category[]> {
    const rows = await this.prismaClient.category.findMany({
      where: options.includeDeleted ? {} : { deletedAt: null },
    });
    return toDomainCategoryList(rows);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.prismaClient.category.count({ where: { slug } });
    return count > 0;
  }

  async create(data: CreateCategoryInput): Promise<Category> {
    const row = await this.prismaClient.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        parentId: data.parentId ?? null,
        status: data.status ?? CATEGORY_STATUSES.DRAFT,
        visibility: data.visibility ?? CATEGORY_VISIBILITIES.PUBLIC,
        sortOrder: data.sortOrder ?? 0,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        seoKeywords: data.seoKeywords ?? [],
      },
    });
    return toDomainCategory(row);
  }

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    const row = await this.prismaClient.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        sortOrder: data.sortOrder,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
    });
    return toDomainCategory(row);
  }

  async updateStatus(id: string, status: CategoryStatus): Promise<Category> {
    const row = await this.prismaClient.category.update({ where: { id }, data: { status } });
    return toDomainCategory(row);
  }

  async updateVisibility(id: string, visibility: CategoryVisibility): Promise<Category> {
    const row = await this.prismaClient.category.update({ where: { id }, data: { visibility } });
    return toDomainCategory(row);
  }

  async softDeleteWithDescendants(id: string): Promise<string[]> {
    return this.prismaClient.$transaction(async (tx) => {
      const rows = await tx.category.findMany({});
      const categories = toDomainCategoryList(rows);
      const ids = [id, ...collectDescendantIds(categories, id)];

      await tx.category.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      return ids;
    });
  }

  async restoreWithDescendants(id: string): Promise<string[]> {
    return this.prismaClient.$transaction(async (tx) => {
      const rows = await tx.category.findMany({});
      const categories = toDomainCategoryList(rows);
      const ids = [id, ...collectDescendantIds(categories, id)];

      await tx.category.updateMany({
        where: { id: { in: ids }, deletedAt: { not: null } },
        data: { deletedAt: null },
      });

      return ids;
    });
  }
}

function buildWhere(filters: CategoryFilterOptions, search?: string): Prisma.CategoryWhereInput {
  const conditions: Prisma.CategoryWhereInput[] = [];

  if (!filters.includeDeleted) {
    conditions.push({ deletedAt: null });
  }
  if (filters.parentId !== undefined) {
    conditions.push({ parentId: filters.parentId });
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
 * `modules/product`'s `ProductPrismaRepository`. */
function buildOrderBy(sort: SortParam[]): Prisma.CategoryOrderByWithRelationInput[] {
  if (sort.length === 0) {
    return [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }];
  }
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
