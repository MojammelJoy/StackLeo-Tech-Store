import { prisma } from "../../../database";

import type {
  ProductOrderSnapshot,
  ProductSnapshotRepository,
} from "./product-snapshot.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `ProductSnapshotRepository`. Defaults
 * to the shared `prisma` client from `database/` (never constructs its
 * own connection), matching every other module's Prisma repository.
 */
export class ProductSnapshotPrismaRepository implements ProductSnapshotRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findManyByIds(productIds: string[]): Promise<Map<string, ProductOrderSnapshot>> {
    if (productIds.length === 0) {
      return new Map();
    }
    const rows = await this.prismaClient.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        currency: true,
        status: true,
        visibility: true,
        deletedAt: true,
      },
    });
    return new Map(rows.map((row) => [row.id, row]));
  }
}
