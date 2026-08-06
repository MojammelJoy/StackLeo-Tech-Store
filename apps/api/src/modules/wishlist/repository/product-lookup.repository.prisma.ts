import { prisma } from "../../../database";

import type { ProductLookupRepository, ProductSnapshot } from "./product-lookup.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `ProductLookupRepository`. Defaults
 * to the shared `prisma` client from `database/` (never constructs its
 * own connection), matching every other module's Prisma repository.
 */
export class ProductLookupPrismaRepository implements ProductLookupRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(productId: string): Promise<ProductSnapshot | null> {
    const row = await this.prismaClient.product.findUnique({
      where: { id: productId },
      select: { id: true, sku: true, price: true, status: true, visibility: true, deletedAt: true },
    });
    return row;
  }
}
