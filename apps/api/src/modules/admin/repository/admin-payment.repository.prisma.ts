import { prisma } from "../../../database";
import { PAYMENT_STATUSES } from "../../payment";

import type { AdminPaymentRepository, PaymentStatusSummary } from "./admin-payment.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `AdminPaymentRepository`. Defaults to
 * the shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class AdminPaymentPrismaRepository implements AdminPaymentRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  /** One `groupBy` instead of seven separate `COUNT`s — "avoid...
   * duplicate database calls". */
  async getStatusSummary(): Promise<PaymentStatusSummary> {
    const grouped = await this.prismaClient.payment.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const counts = new Map(grouped.map((group) => [group.status, group._count.status]));

    return {
      pendingCount: counts.get(PAYMENT_STATUSES.PENDING) ?? 0,
      processingCount: counts.get(PAYMENT_STATUSES.PROCESSING) ?? 0,
      succeededCount: counts.get(PAYMENT_STATUSES.SUCCEEDED) ?? 0,
      failedCount: counts.get(PAYMENT_STATUSES.FAILED) ?? 0,
      cancelledCount: counts.get(PAYMENT_STATUSES.CANCELLED) ?? 0,
      partiallyRefundedCount: counts.get(PAYMENT_STATUSES.PARTIALLY_REFUNDED) ?? 0,
      refundedCount: counts.get(PAYMENT_STATUSES.REFUNDED) ?? 0,
    };
  }
}
