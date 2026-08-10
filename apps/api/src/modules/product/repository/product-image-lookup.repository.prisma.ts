import { prisma } from "../../../database";

import type {
  ProductDisplayImage,
  ProductImageLookupRepository,
} from "./product-image-lookup.repository";
import type { PrismaClient } from "@prisma/client";

const MEDIA_OWNER_TYPE_PRODUCT = "product";
const MEDIA_PURPOSE_PRODUCT_IMAGE = "product_image";
const MEDIA_STATUS_READY = "ready";

/**
 * Prisma-backed implementation of `ProductImageLookupRepository`. One
 * query for every requested product id (via `media_assets`'
 * `[ownerType, ownerId]` index — see `prisma/schema.prisma`), never one
 * query per product.
 *
 * Deterministic "display image" rule — `MediaAsset` has no primary-image
 * flag (see that model's doc comment in `prisma/schema.prisma`), so one
 * had to be chosen: among a product's `ready`, `product_image`-purpose
 * assets (gallery images, documents, and non-`ready` assets are never
 * eligible), the earliest-created one wins (`createdAt` ascending, `id`
 * ascending as a final tiebreaker for full determinism) — the first
 * image ever uploaded for a product is treated as its main photo.
 */
export class ProductImageLookupPrismaRepository implements ProductImageLookupRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findDisplayImagesByProductIds(
    productIds: string[],
  ): Promise<Map<string, ProductDisplayImage>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const rows = await this.prismaClient.mediaAsset.findMany({
      where: {
        ownerType: MEDIA_OWNER_TYPE_PRODUCT,
        ownerId: { in: productIds },
        purpose: MEDIA_PURPOSE_PRODUCT_IMAGE,
        status: MEDIA_STATUS_READY,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true, url: true, altText: true, ownerId: true },
    });

    const images = new Map<string, ProductDisplayImage>();
    for (const row of rows) {
      if (row.ownerId && !images.has(row.ownerId)) {
        images.set(row.ownerId, { id: row.id, url: row.url, altText: row.altText });
      }
    }
    return images;
  }
}
