import { prisma } from "../../../database";

import type {
  ProductCategoryFacts,
  ProductCategoryLookupRepository,
} from "./product-category-lookup.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `ProductCategoryLookupRepository`.
 * Defaults to the shared `prisma` client from `database/` (never
 * constructs its own connection), matching every other module's Prisma
 * repository.
 */
export class ProductCategoryLookupPrismaRepository implements ProductCategoryLookupRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findManyByIds(productIds: string[]): Promise<Map<string, ProductCategoryFacts>> {
    if (productIds.length === 0) {
      return new Map();
    }
    const rows = await this.prismaClient.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, categoryId: true, brandId: true },
    });
    return new Map(
      rows.map((row) => [row.id, { categoryId: row.categoryId, brandId: row.brandId }]),
    );
  }
}
