import {
  buildCursorPaginationMeta,
  buildPaginationMeta,
  getPaginationOffset,
} from "../../../common";
import { prisma } from "../../../database";

import type {
  CursorPaginatedResult,
  CursorPaginationParams,
  PaginatedResult,
  ParsedQuery,
  SortParam,
} from "../../../common";
import type { ProductStatus, ProductVisibility } from "../constants";
import type { ProductFilterOptions } from "../interfaces";
import type {
  CreateProductInput,
  CreateProductVariantInput,
  Product,
  UpdateProductInput,
  UpsertProductSpecificationInput,
} from "../types";
import type { ProductLookupOptions, ProductRepository } from "./product.repository";
import type { Prisma, PrismaClient, Product as PrismaProduct } from "@prisma/client";

/** Prisma's generated model type stores `status`/`visibility` as plain
 * `string` (they're `String` columns, not native Postgres enums — see
 * `prisma/schema.prisma`'s doc comment on `Product`). This is the one
 * place that narrows them back to this module's literal unions: every
 * row in the table only ever got there through a Zod-validated DTO, so
 * the cast is safe, and it keeps the narrower types everywhere else
 * (service, mapper, response DTOs). */
function toDomainProduct(row: PrismaProduct): Product {
  return {
    ...row,
    status: row.status as ProductStatus,
    visibility: row.visibility as ProductVisibility,
  };
}

function toDomainProductList(rows: PrismaProduct[]): Product[] {
  return rows.map(toDomainProduct);
}

/**
 * Prisma-backed implementation of `ProductRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class ProductPrismaRepository implements ProductRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string, options: ProductLookupOptions = {}): Promise<Product | null> {
    const row = await this.prismaClient.product.findUnique({ where: { id } });
    if (!row || (row.deletedAt && !options.includeDeleted)) {
      return null;
    }
    return toDomainProduct(row);
  }

  async findBySlug(slug: string, options: ProductLookupOptions = {}): Promise<Product | null> {
    const row = await this.prismaClient.product.findUnique({ where: { slug } });
    if (!row || (row.deletedAt && !options.includeDeleted)) {
      return null;
    }
    return toDomainProduct(row);
  }

  async findManyByIds(ids: string[], options: ProductLookupOptions = {}): Promise<Product[]> {
    if (ids.length === 0) {
      return [];
    }
    const rows = await this.prismaClient.product.findMany({
      where: {
        id: { in: ids },
        ...(options.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    return toDomainProductList(rows);
  }

  async findAll(
    query: ParsedQuery,
    filters: ProductFilterOptions = {},
  ): Promise<PaginatedResult<Product>> {
    const where = buildWhere(filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.product.findMany({ where, orderBy, skip, take }),
      this.prismaClient.product.count({ where }),
    ]);

    return {
      items: toDomainProductList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async findAllCursor(
    params: CursorPaginationParams,
    query: Pick<ParsedQuery, "sort" | "search">,
    filters: ProductFilterOptions = {},
  ): Promise<CursorPaginatedResult<Product>> {
    const where = buildWhere(filters, query.search);
    const orderBy = buildOrderBy(query.sort);

    const rows = await this.prismaClient.product.findMany({
      where,
      orderBy,
      take: params.limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    });

    const page = buildCursorPaginationMeta(rows, params.limit);
    return { items: toDomainProductList(page.items), meta: page.meta };
  }

  async existsBySku(sku: string): Promise<boolean> {
    const [productCount, variantCount] = await Promise.all([
      this.prismaClient.product.count({ where: { sku } }),
      this.prismaClient.productVariant.count({ where: { sku } }),
    ]);
    return productCount > 0 || variantCount > 0;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.prismaClient.product.count({ where: { slug } });
    return count > 0;
  }

  async createWithRelations(
    data: CreateProductInput,
    variants: Omit<CreateProductVariantInput, "productId">[],
    specifications: UpsertProductSpecificationInput[],
  ): Promise<Product> {
    const created = await this.prismaClient.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description ?? null,
          sku: data.sku,
          price: data.price,
          currency: data.currency,
          status: data.status,
          visibility: data.visibility,
          categoryId: data.categoryId ?? null,
          tags: data.tags ?? [],
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
          seoKeywords: data.seoKeywords ?? [],
        },
      });

      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((variant) => ({
            productId: product.id,
            sku: variant.sku,
            name: variant.name,
            attributes: variant.attributes as Prisma.InputJsonValue,
            price: variant.price ?? null,
            currency: variant.currency ?? null,
            isActive: variant.isActive ?? true,
          })),
        });
      }

      if (specifications.length > 0) {
        await tx.productSpecification.createMany({
          data: specifications.map((specification) => ({
            productId: product.id,
            key: specification.key,
            value: specification.value,
            sortOrder: specification.sortOrder ?? 0,
          })),
        });
      }

      return product;
    });

    return toDomainProduct(created);
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    const row = await this.prismaClient.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        categoryId: data.categoryId,
        tags: data.tags,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
    });
    return toDomainProduct(row);
  }

  async updateStatus(id: string, status: ProductStatus): Promise<Product> {
    const row = await this.prismaClient.product.update({ where: { id }, data: { status } });
    return toDomainProduct(row);
  }

  async updateVisibility(id: string, visibility: ProductVisibility): Promise<Product> {
    const row = await this.prismaClient.product.update({ where: { id }, data: { visibility } });
    return toDomainProduct(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.prismaClient.product.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string): Promise<void> {
    await this.prismaClient.product.update({ where: { id }, data: { deletedAt: null } });
  }
}

function buildWhere(filters: ProductFilterOptions, search?: string): Prisma.ProductWhereInput {
  const conditions: Prisma.ProductWhereInput[] = [];

  if (!filters.includeDeleted) {
    conditions.push({ deletedAt: null });
  }
  if (filters.categoryId) {
    conditions.push({ categoryId: filters.categoryId });
  }
  if (filters.status) {
    conditions.push({ status: filters.status });
  }
  if (filters.visibility) {
    conditions.push({ visibility: filters.visibility });
  }
  if (filters.priceMin !== undefined) {
    conditions.push({ price: { gte: filters.priceMin } });
  }
  if (filters.priceMax !== undefined) {
    conditions.push({ price: { lte: filters.priceMax } });
  }
  if (filters.tags && filters.tags.length > 0) {
    conditions.push({ tags: { hasSome: filters.tags } });
  }

  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ],
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

/** Always appends an `id` tiebreaker — required for cursor pagination
 * to be deterministic (rows with an equal primary sort value must still
 * resolve to one stable order), and harmless for page pagination. */
function buildOrderBy(sort: SortParam[]): Prisma.ProductOrderByWithRelationInput[] {
  if (sort.length === 0) {
    return [{ createdAt: "desc" }, { id: "asc" }];
  }
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
