import { prisma } from "../../../database";

import type {
  ProductAvailabilityRepository,
  ProductAvailabilitySnapshot,
  ProductVariantAvailabilitySnapshot,
} from "./product-availability.repository";
import type {
  PrismaClient,
  Product as PrismaProduct,
  ProductVariant as PrismaProductVariant,
} from "@prisma/client";

function toSnapshot(row: PrismaProduct): ProductAvailabilitySnapshot {
  return {
    id: row.id,
    sku: row.sku,
    price: row.price,
    currency: row.currency,
    status: row.status,
    visibility: row.visibility,
    deletedAt: row.deletedAt,
  };
}

function toVariantSnapshot(row: PrismaProductVariant): ProductVariantAvailabilitySnapshot {
  return {
    id: row.id,
    productId: row.productId,
    sku: row.sku,
    price: row.price,
    currency: row.currency,
    isActive: row.isActive,
  };
}

/**
 * Prisma-backed implementation of `ProductAvailabilityRepository`.
 * Defaults to the shared `prisma` client from `database/` (never
 * constructs its own connection), matching every other module's Prisma
 * repository.
 */
export class ProductAvailabilityPrismaRepository implements ProductAvailabilityRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(productId: string): Promise<ProductAvailabilitySnapshot | null> {
    const row = await this.prismaClient.product.findUnique({ where: { id: productId } });
    return row ? toSnapshot(row) : null;
  }

  async findManyByIds(productIds: string[]): Promise<Map<string, ProductAvailabilitySnapshot>> {
    if (productIds.length === 0) {
      return new Map();
    }
    const rows = await this.prismaClient.product.findMany({
      where: { id: { in: productIds } },
    });
    return new Map(rows.map((row) => [row.id, toSnapshot(row)]));
  }

  async findVariantBySku(sku: string): Promise<ProductVariantAvailabilitySnapshot | null> {
    const row = await this.prismaClient.productVariant.findUnique({ where: { sku } });
    return row ? toVariantSnapshot(row) : null;
  }

  async findManyVariantsBySkus(
    skus: string[],
  ): Promise<Map<string, ProductVariantAvailabilitySnapshot>> {
    if (skus.length === 0) {
      return new Map();
    }
    const rows = await this.prismaClient.productVariant.findMany({
      where: { sku: { in: skus } },
    });
    return new Map(rows.map((row) => [row.sku, toVariantSnapshot(row)]));
  }

  /** `quantity`/`reservedQuantity` are summed across every
   * `InventoryItem` row for `sku` (one per warehouse) via a raw
   * aggregate — mirrors `modules/search`'s `SearchPrismaRepository`
   * `getInStockSkus`, the same "recompute available stock, never store
   * it" rule `prisma/schema.prisma`'s `InventoryItem` doc comment
   * documents. */
  async getAvailableQuantity(sku: string): Promise<number> {
    const rows = await this.prismaClient.$queryRaw<Array<{ available: bigint | null }>>`
      SELECT SUM(quantity - reserved_quantity)::bigint AS available
      FROM inventory_items
      WHERE sku = ${sku}
    `;
    const available = Number(rows[0]?.available ?? 0);
    return Number.isFinite(available) && available > 0 ? available : 0;
  }
}
