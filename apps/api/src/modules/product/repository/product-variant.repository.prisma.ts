import { prisma } from "../../../database";

import type {
  CreateProductVariantInput,
  ProductVariant,
  UpdateProductVariantInput,
} from "../types";
import type { ProductVariantRepository } from "./product-variant.repository";
import type { Prisma, PrismaClient, ProductVariant as PrismaProductVariant } from "@prisma/client";

/** Prisma's generated model type stores `attributes` as `Prisma.JsonValue`
 * (a native JSON column) — this module's domain type narrows it to a
 * flat string map, since every row only ever got there through a
 * Zod-validated `productVariantAttributesSchema`. */
function toDomainVariant(row: PrismaProductVariant): ProductVariant {
  return { ...row, attributes: row.attributes as Record<string, string> };
}

/**
 * Prisma-backed implementation of `ProductVariantRepository`. Defaults
 * to the shared `prisma` client from `database/` (never constructs its
 * own connection), matching every other module's Prisma repository.
 */
export class ProductVariantPrismaRepository implements ProductVariantRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<ProductVariant | null> {
    const row = await this.prismaClient.productVariant.findUnique({ where: { id } });
    return row ? toDomainVariant(row) : null;
  }

  async findByProductId(productId: string): Promise<ProductVariant[]> {
    const rows = await this.prismaClient.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toDomainVariant);
  }

  async existsBySku(sku: string): Promise<boolean> {
    const [variantCount, productCount] = await Promise.all([
      this.prismaClient.productVariant.count({ where: { sku } }),
      this.prismaClient.product.count({ where: { sku } }),
    ]);
    return variantCount > 0 || productCount > 0;
  }

  async create(data: CreateProductVariantInput): Promise<ProductVariant> {
    const row = await this.prismaClient.productVariant.create({
      data: {
        productId: data.productId,
        sku: data.sku,
        name: data.name,
        attributes: data.attributes as Prisma.InputJsonValue,
        price: data.price ?? null,
        currency: data.currency ?? null,
        isActive: data.isActive ?? true,
      },
    });
    return toDomainVariant(row);
  }

  async update(id: string, data: UpdateProductVariantInput): Promise<ProductVariant> {
    const row = await this.prismaClient.productVariant.update({
      where: { id },
      data: {
        name: data.name,
        attributes:
          data.attributes !== undefined ? (data.attributes as Prisma.InputJsonValue) : undefined,
        price: data.price,
        currency: data.currency,
        isActive: data.isActive,
      },
    });
    return toDomainVariant(row);
  }

  async delete(id: string): Promise<void> {
    await this.prismaClient.productVariant.delete({ where: { id } });
  }
}
