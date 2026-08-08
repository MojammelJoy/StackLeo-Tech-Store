import { prisma } from "../../../database";
import { COUPON_STATUSES } from "../../coupon";
import { INVENTORY_STATUSES } from "../../inventory";
import { ORDER_STATUSES } from "../../order";
import { PAYMENT_STATUSES } from "../../payment";
import { MODERATION_STATUSES } from "../../review";

import type { DashboardOverview } from "../types";
import type { AdminDashboardRepository } from "./admin-dashboard.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `AdminDashboardRepository`. Defaults
 * to the shared `prisma` client from `database/` (never constructs its
 * own connection), matching every other module's Prisma repository.
 *
 * Every field is one indexed `COUNT`, all issued in parallel via
 * `Promise.all` — "avoid loading entire tables into memory", "use
 * efficient Prisma queries". Status values are imported from each
 * owning module's own constants (never re-typed as bare strings here)
 * so this repository can never drift from what those modules actually
 * persist — this module's whole purpose is reading across domains, so
 * depending on their public constants is the intended reuse, not the
 * cross-module decoupling every *peer* business domain in this app
 * otherwise practices (see e.g. `modules/cart`'s
 * `SELLABLE_PRODUCT_STATUS` doc comment for why a peer avoids this same
 * import).
 */
export class AdminDashboardPrismaRepository implements AdminDashboardRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async getOverview(): Promise<DashboardOverview> {
    const [
      totalUsers,
      activeUsers,
      totalProducts,
      totalCategories,
      totalBrands,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      lowStockCount,
      outOfStockCount,
      pendingModerationReviews,
      unreadNotifications,
      totalCoupons,
      activeCoupons,
      pendingPayments,
      failedPayments,
    ] = await Promise.all([
      this.prismaClient.user.count(),
      this.prismaClient.user.count({ where: { isActive: true } }),
      this.prismaClient.product.count({ where: { deletedAt: null } }),
      this.prismaClient.category.count({ where: { deletedAt: null } }),
      this.prismaClient.brand.count({ where: { deletedAt: null } }),
      this.prismaClient.order.count(),
      this.prismaClient.order.count({ where: { status: ORDER_STATUSES.PENDING } }),
      this.prismaClient.order.count({ where: { status: ORDER_STATUSES.COMPLETED } }),
      this.prismaClient.order.count({ where: { status: ORDER_STATUSES.CANCELLED } }),
      this.prismaClient.inventoryItem.count({ where: { status: INVENTORY_STATUSES.LOW_STOCK } }),
      this.prismaClient.inventoryItem.count({ where: { status: INVENTORY_STATUSES.OUT_OF_STOCK } }),
      this.prismaClient.review.count({
        where: { moderationStatus: MODERATION_STATUSES.PENDING, deletedAt: null },
      }),
      this.prismaClient.notification.count({ where: { isRead: false, deletedAt: null } }),
      this.prismaClient.coupon.count({ where: { deletedAt: null } }),
      this.prismaClient.coupon.count({
        where: { deletedAt: null, status: COUPON_STATUSES.ACTIVE },
      }),
      this.prismaClient.payment.count({ where: { status: PAYMENT_STATUSES.PENDING } }),
      this.prismaClient.payment.count({ where: { status: PAYMENT_STATUSES.FAILED } }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      products: { total: totalProducts },
      categories: { total: totalCategories },
      brands: { total: totalBrands },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      inventory: { lowStockCount, outOfStockCount },
      reviews: { pendingModerationCount: pendingModerationReviews },
      notifications: { unreadCount: unreadNotifications },
      coupons: { total: totalCoupons, active: activeCoupons },
      payments: { pendingCount: pendingPayments, failedCount: failedPayments },
    };
  }
}
