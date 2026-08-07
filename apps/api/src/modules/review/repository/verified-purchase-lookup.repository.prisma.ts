import { prisma } from "../../../database";

import type {
  VerifiedPurchase,
  VerifiedPurchaseLookupRepository,
} from "./verified-purchase-lookup.repository";
import type { PrismaClient } from "@prisma/client";

/** An order counts as a completed purchase for review-eligibility
 * purposes only once it reaches `modules/order`'s terminal successful
 * status — duplicated as a bare string, the same cross-module
 * decoupling reason `modules/cart`'s `SELLABLE_PRODUCT_STATUS` documents
 * (this module never imports `modules/order`). Deliberately excludes
 * `"refunded"`: a purchase that was reversed no longer backs a "verified
 * purchase" badge. */
const COMPLETED_ORDER_STATUS = "completed";

/**
 * Prisma-backed implementation of `VerifiedPurchaseLookupRepository`.
 * Defaults to the shared `prisma` client from `database/` (never
 * constructs its own connection), matching every other module's Prisma
 * repository.
 */
export class VerifiedPurchaseLookupPrismaRepository implements VerifiedPurchaseLookupRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findVerifiedPurchase(userId: string, productId: string): Promise<VerifiedPurchase | null> {
    const orderItem = await this.prismaClient.orderItem.findFirst({
      where: { productId, order: { userId, status: COMPLETED_ORDER_STATUS } },
      orderBy: { createdAt: "asc" },
      select: { id: true, orderId: true },
    });
    return orderItem ? { orderId: orderItem.orderId, orderItemId: orderItem.id } : null;
  }
}
