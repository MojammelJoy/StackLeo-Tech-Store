import { prisma } from "../../../database";

import type { ProductSpecification, UpsertProductSpecificationInput } from "../types";
import type { ProductSpecificationRepository } from "./product-specification.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `ProductSpecificationRepository`.
 * Defaults to the shared `prisma` client from `database/` (never
 * constructs its own connection), matching every other module's Prisma
 * repository.
 */
export class ProductSpecificationPrismaRepository implements ProductSpecificationRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findByProductId(productId: string): Promise<ProductSpecification[]> {
    return this.prismaClient.productSpecification.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
  }

  async replaceAll(
    productId: string,
    items: UpsertProductSpecificationInput[],
  ): Promise<ProductSpecification[]> {
    await this.prismaClient.$transaction([
      this.prismaClient.productSpecification.deleteMany({ where: { productId } }),
      ...(items.length > 0
        ? [
            this.prismaClient.productSpecification.createMany({
              data: items.map((item, index) => ({
                productId,
                key: item.key,
                value: item.value,
                sortOrder: item.sortOrder ?? index,
              })),
            }),
          ]
        : []),
    ]);

    return this.findByProductId(productId);
  }
}
