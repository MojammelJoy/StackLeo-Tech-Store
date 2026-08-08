import { prisma } from "../../../database";

import type { ProductExistenceRepository } from "./product-existence.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `ProductExistenceRepository`. Defaults
 * to the shared `prisma` client from `database/` (never constructs its
 * own connection), matching every other module's Prisma repository.
 */
export class ProductExistencePrismaRepository implements ProductExistenceRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async exists(productId: string): Promise<boolean> {
    const count = await this.prismaClient.product.count({
      where: { id: productId, deletedAt: null },
    });
    return count > 0;
  }
}
