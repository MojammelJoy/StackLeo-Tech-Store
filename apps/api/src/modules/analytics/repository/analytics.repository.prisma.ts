import { Prisma } from "@prisma/client";

import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { TIME_GRANULARITIES } from "../constants";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { TimeGranularity } from "../constants";
import type { DateRange } from "../interfaces";
import type { MetricQuery } from "../metrics";
import type {
  CouponAnalyticsSummary,
  CouponMetric,
  CouponPerformance,
  CustomerAnalyticsSummary,
  CustomerMetric,
  CustomerPerformance,
  InventoryAdjustmentRanking,
  InventoryAnalyticsSummary,
  InventoryMetric,
  InventoryMovementSummary,
  OrderAnalyticsSummary,
  OrderMetric,
  OrderStatusBreakdown,
  PaymentAnalyticsSummary,
  PaymentMetric,
  ProductCatalogSnapshot,
  ProductMetric,
  ProductPerformance,
  ProductReviewVolume,
  RatingBreakdown,
  RevenueMetric,
  RevenueSummary,
  SalesMetric,
  SalesSummary,
  CategoryPerformance,
  ReviewAnalyticsSummary,
} from "../types";
import type { AnalyticsRepository } from "./analytics.repository";
import type { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Bare-string domain vocabulary this module reads but never owns — the same
// cross-module decoupling every foundation in this app practices (this
// module never imports modules/order, modules/payment, modules/coupon,
// modules/inventory, modules/review, or modules/product). Every value here
// is read-only lookup data, never written.
// ---------------------------------------------------------------------------
const ORDER_STATUS_COMPLETED = "completed";
const ORDER_STATUS_CANCELLED = "cancelled";
const PAYMENT_STATUS_SUCCEEDED = "succeeded";
const PAYMENT_STATUS_FAILED = "failed";
const PAYMENT_STATUS_PENDING = "pending";
const PAYMENT_STATUS_REFUNDED = "refunded";
const PAYMENT_STATUS_PARTIALLY_REFUNDED = "partially_refunded";
const COUPON_STATUS_ACTIVE = "active";
const INVENTORY_MOVEMENT_TYPES_IN = ["stock_in", "transfer_in"];
const INVENTORY_MOVEMENT_TYPES_OUT = ["stock_out", "transfer_out"];
const PRODUCT_STATUS_ACTIVE = "active";
const REVIEW_STATUS_APPROVED = "approved";
const REVIEW_STATUS_PENDING = "pending";
const REVIEW_STATUS_REJECTED = "rejected";
const REVIEW_STATUS_FLAGGED = "flagged";

/** Postgres `date_trunc()` accepts its unit as an ordinary text
 * parameter (unlike a table/column name, it never needs `Prisma.raw`) —
 * every time-series query below passes this through a normal, fully
 * parameterized `$queryRaw` interpolation. */
function toDateTruncUnit(granularity: TimeGranularity): string {
  switch (granularity) {
    case TIME_GRANULARITIES.HOURLY:
      return "hour";
    case TIME_GRANULARITIES.WEEKLY:
      return "week";
    case TIME_GRANULARITIES.MONTHLY:
      return "month";
    case TIME_GRANULARITIES.YEARLY:
      return "year";
    case TIME_GRANULARITIES.DAILY:
    default:
      return "day";
  }
}

function toNumber(value: bigint | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return typeof value === "bigint" ? Number(value) : value;
}

function safeRatio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

/** Resolves the client's validated `sort` param (already whitelist-
 * checked by `common/`'s `parseSortParams` before this ever runs) to a
 * SQL column alias + direction — the only place a raw `ORDER BY` is
 * built from user input, and only ever from `columnMap`'s own values,
 * never the client's string directly. */
function resolveSortColumn(
  columnMap: Record<string, string>,
  sort: SortParam[],
  fallbackColumn: string,
): { column: string; direction: "ASC" | "DESC" } {
  const first = sort[0];
  const mappedColumn = first ? columnMap[first.field] : undefined;
  const column = mappedColumn ?? fallbackColumn;
  const direction = first?.order === "asc" ? "ASC" : "DESC";
  return { column, direction };
}

/**
 * Prisma-backed implementation of `AnalyticsRepository`. Defaults to
 * the shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 *
 * Every method here is read-only — `SELECT`/aggregate queries only,
 * never `create`/`update`/`delete`/`$executeRaw`. The 8 `get*Metrics`
 * time-series methods all use `$queryRaw` for one specific reason
 * neither `groupBy` nor `aggregate` can express: grouping by a
 * *truncated* date (`date_trunc`), which Prisma has no native support
 * for. `getTopProducts`/`getCategoryPerformance` also use `$queryRaw`,
 * for a second reason: a per-row revenue figure
 * (`quantity * unitPrice`, summed) is a computed expression Prisma's
 * `_sum` can only apply to a single stored column. Every other ranking/
 * summary method uses native `groupBy`/`aggregate`/`count` — see each
 * method's own comment.
 */
export class AnalyticsPrismaRepository implements AnalyticsRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  // =========================================================================
  // Generic time series
  // =========================================================================

  async getSalesMetrics(query: MetricQuery): Promise<SalesMetric[]> {
    const unit = toDateTruncUnit(query.granularity);
    const rows = await this.prismaClient.$queryRaw<
      Array<{
        period: Date;
        order_count: bigint;
        units_sold: bigint | null;
        revenue: bigint | null;
      }>
    >`
      SELECT date_trunc(${unit}, o.created_at) AS period,
             COUNT(DISTINCT o.id)::bigint AS order_count,
             COALESCE(SUM(oi.quantity), 0)::bigint AS units_sold,
             COALESCE(SUM(o.total), 0)::bigint AS revenue
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.created_at >= ${query.from} AND o.created_at < ${query.to}
      GROUP BY period
      ORDER BY period ASC
    `;
    return rows.map((row) => ({
      period: row.period,
      granularity: query.granularity,
      orderCount: toNumber(row.order_count),
      unitsSold: toNumber(row.units_sold),
      revenue: toNumber(row.revenue),
    }));
  }

  async getRevenueMetrics(query: MetricQuery): Promise<RevenueMetric[]> {
    const unit = toDateTruncUnit(query.granularity);
    const rows = await this.prismaClient.$queryRaw<
      Array<{
        period: Date;
        gross_revenue: bigint | null;
        discount_total: bigint | null;
        currency: string | null;
      }>
    >`
      SELECT date_trunc(${unit}, created_at) AS period,
             COALESCE(SUM(total), 0)::bigint AS gross_revenue,
             COALESCE(SUM(discount_total), 0)::bigint AS discount_total,
             MAX(currency) AS currency
      FROM orders
      WHERE created_at >= ${query.from} AND created_at < ${query.to}
      GROUP BY period
      ORDER BY period ASC
    `;
    return rows.map((row) => {
      const grossRevenue = toNumber(row.gross_revenue);
      const discountTotal = toNumber(row.discount_total);
      return {
        period: row.period,
        granularity: query.granularity,
        grossRevenue,
        netRevenue: grossRevenue - discountTotal,
        discountTotal,
        currency: row.currency ?? "",
      };
    });
  }

  async getCustomerMetrics(query: MetricQuery): Promise<CustomerMetric[]> {
    const unit = toDateTruncUnit(query.granularity);
    const rows = await this.prismaClient.$queryRaw<Array<{ period: Date; new_customers: bigint }>>`
      SELECT date_trunc(${unit}, created_at) AS period,
             COUNT(*)::bigint AS new_customers
      FROM users
      WHERE created_at >= ${query.from} AND created_at < ${query.to}
      GROUP BY period
      ORDER BY period ASC
    `;
    return rows.map((row) => ({
      period: row.period,
      granularity: query.granularity,
      newCustomers: toNumber(row.new_customers),
    }));
  }

  async getProductMetrics(query: MetricQuery): Promise<ProductMetric[]> {
    const unit = toDateTruncUnit(query.granularity);
    const rows = await this.prismaClient.$queryRaw<
      Array<{ period: Date; units_sold: bigint | null; revenue: bigint | null }>
    >`
      SELECT date_trunc(${unit}, o.created_at) AS period,
             COALESCE(SUM(oi.quantity), 0)::bigint AS units_sold,
             COALESCE(SUM(oi.quantity * oi.unit_price), 0)::bigint AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.created_at >= ${query.from} AND o.created_at < ${query.to}
      GROUP BY period
      ORDER BY period ASC
    `;
    return rows.map((row) => ({
      period: row.period,
      granularity: query.granularity,
      unitsSold: toNumber(row.units_sold),
      revenue: toNumber(row.revenue),
    }));
  }

  async getInventoryMetrics(query: MetricQuery): Promise<InventoryMetric[]> {
    const unit = toDateTruncUnit(query.granularity);
    const rows = await this.prismaClient.$queryRaw<
      Array<{ period: Date; stock_additions: bigint | null; stock_deductions: bigint | null }>
    >`
      SELECT date_trunc(${unit}, created_at) AS period,
             COALESCE(SUM(quantity) FILTER (WHERE type = ANY(${INVENTORY_MOVEMENT_TYPES_IN})), 0)::bigint AS stock_additions,
             COALESCE(SUM(quantity) FILTER (WHERE type = ANY(${INVENTORY_MOVEMENT_TYPES_OUT})), 0)::bigint AS stock_deductions
      FROM inventory_movements
      WHERE created_at >= ${query.from} AND created_at < ${query.to}
      GROUP BY period
      ORDER BY period ASC
    `;
    return rows.map((row) => ({
      period: row.period,
      granularity: query.granularity,
      stockAdditions: toNumber(row.stock_additions),
      stockDeductions: toNumber(row.stock_deductions),
    }));
  }

  async getOrderMetrics(query: MetricQuery): Promise<OrderMetric[]> {
    const unit = toDateTruncUnit(query.granularity);
    const rows = await this.prismaClient.$queryRaw<
      Array<{
        period: Date;
        order_count: bigint;
        average_order_value: number | null;
        cancelled_count: bigint;
      }>
    >`
      SELECT date_trunc(${unit}, created_at) AS period,
             COUNT(*)::bigint AS order_count,
             COALESCE(AVG(total), 0)::float AS average_order_value,
             COUNT(*) FILTER (WHERE status = ${ORDER_STATUS_CANCELLED})::bigint AS cancelled_count
      FROM orders
      WHERE created_at >= ${query.from} AND created_at < ${query.to}
      GROUP BY period
      ORDER BY period ASC
    `;
    return rows.map((row) => ({
      period: row.period,
      granularity: query.granularity,
      orderCount: toNumber(row.order_count),
      averageOrderValue: row.average_order_value ?? 0,
      cancellationRate: safeRatio(toNumber(row.cancelled_count), toNumber(row.order_count)),
    }));
  }

  async getPaymentMetrics(query: MetricQuery): Promise<PaymentMetric[]> {
    const unit = toDateTruncUnit(query.granularity);
    const rows = await this.prismaClient.$queryRaw<
      Array<{
        period: Date;
        total_count: bigint;
        succeeded_count: bigint;
        refunded_count: bigint;
        total_processed: bigint | null;
      }>
    >`
      SELECT date_trunc(${unit}, created_at) AS period,
             COUNT(*)::bigint AS total_count,
             COUNT(*) FILTER (WHERE status = ${PAYMENT_STATUS_SUCCEEDED})::bigint AS succeeded_count,
             COUNT(*) FILTER (WHERE status IN (${PAYMENT_STATUS_REFUNDED}, ${PAYMENT_STATUS_PARTIALLY_REFUNDED}))::bigint AS refunded_count,
             COALESCE(SUM(amount) FILTER (WHERE status = ${PAYMENT_STATUS_SUCCEEDED}), 0)::bigint AS total_processed
      FROM payments
      WHERE created_at >= ${query.from} AND created_at < ${query.to}
      GROUP BY period
      ORDER BY period ASC
    `;
    return rows.map((row) => ({
      period: row.period,
      granularity: query.granularity,
      successRate: safeRatio(toNumber(row.succeeded_count), toNumber(row.total_count)),
      refundRate: safeRatio(toNumber(row.refunded_count), toNumber(row.total_count)),
      totalProcessed: toNumber(row.total_processed),
    }));
  }

  async getCouponMetrics(query: MetricQuery): Promise<CouponMetric[]> {
    const unit = toDateTruncUnit(query.granularity);
    const rows = await this.prismaClient.$queryRaw<
      Array<{ period: Date; redemption_count: bigint; total_discount_given: bigint | null }>
    >`
      SELECT date_trunc(${unit}, created_at) AS period,
             COUNT(*)::bigint AS redemption_count,
             COALESCE(SUM(discount_amount), 0)::bigint AS total_discount_given
      FROM coupon_redemptions
      WHERE created_at >= ${query.from} AND created_at < ${query.to} AND removed_at IS NULL
      GROUP BY period
      ORDER BY period ASC
    `;
    return rows.map((row) => ({
      period: row.period,
      granularity: query.granularity,
      redemptionCount: toNumber(row.redemption_count),
      totalDiscountGiven: toNumber(row.total_discount_given),
    }));
  }

  // =========================================================================
  // Sales
  // =========================================================================

  async getSalesSummary(range: DateRange): Promise<SalesSummary> {
    const where = { createdAt: { gte: range.from, lt: range.to } };
    const [totals, completed, cancelledCount] = await Promise.all([
      this.prismaClient.order.aggregate({ where, _sum: { total: true }, _count: true }),
      this.prismaClient.order.aggregate({
        where: { ...where, status: ORDER_STATUS_COMPLETED },
        _sum: { total: true },
        _count: true,
      }),
      this.prismaClient.order.count({ where: { ...where, status: ORDER_STATUS_CANCELLED } }),
    ]);

    const totalSales = totals._sum.total ?? 0;
    const orderCount = totals._count;
    return {
      totalSales,
      orderCount,
      completedSales: completed._sum.total ?? 0,
      completedOrderCount: completed._count,
      cancelledOrderCount: cancelledCount,
      averageOrderValue: safeRatio(totalSales, orderCount),
    };
  }

  // =========================================================================
  // Revenue
  // =========================================================================

  async getRevenueSummary(range: DateRange): Promise<RevenueSummary> {
    const orderWhere = { createdAt: { gte: range.from, lt: range.to } };
    const paymentWhere = { createdAt: { gte: range.from, lt: range.to } };

    const [orderAgg, paidAgg, completedAgg, cancelledAgg] = await Promise.all([
      this.prismaClient.order.aggregate({
        where: orderWhere,
        _sum: { total: true, discountTotal: true },
      }),
      this.prismaClient.payment.aggregate({
        where: { ...paymentWhere, status: PAYMENT_STATUS_SUCCEEDED },
        _sum: { amount: true },
      }),
      this.prismaClient.order.aggregate({
        where: { ...orderWhere, status: ORDER_STATUS_COMPLETED },
        _sum: { total: true },
      }),
      this.prismaClient.order.aggregate({
        where: { ...orderWhere, status: ORDER_STATUS_CANCELLED },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    return {
      orderTotal: orderAgg._sum.total ?? 0,
      paidAmount: paidAgg._sum.amount ?? 0,
      completedSales: completedAgg._sum.total ?? 0,
      cancelledAmount: cancelledAgg._sum.total ?? 0,
      cancelledOrderCount: cancelledAgg._count,
      discountTotal: orderAgg._sum.discountTotal ?? 0,
    };
  }

  // =========================================================================
  // Orders
  // =========================================================================

  async getOrderSummary(range: DateRange): Promise<OrderAnalyticsSummary> {
    const where = { createdAt: { gte: range.from, lt: range.to } };
    const [totals, completedCount, cancelledCount, itemsAgg] = await Promise.all([
      this.prismaClient.order.aggregate({ where, _sum: { total: true }, _count: true }),
      this.prismaClient.order.count({ where: { ...where, status: ORDER_STATUS_COMPLETED } }),
      this.prismaClient.order.count({ where: { ...where, status: ORDER_STATUS_CANCELLED } }),
      this.prismaClient.orderItem.aggregate({
        where: { order: where },
        _sum: { quantity: true },
      }),
    ]);

    const orderCount = totals._count;
    return {
      orderCount,
      completedCount,
      cancelledCount,
      completionRate: safeRatio(completedCount, orderCount),
      cancellationRate: safeRatio(cancelledCount, orderCount),
      averageOrderValue: safeRatio(totals._sum.total ?? 0, orderCount),
      averageItemsPerOrder:
        orderCount === 0 ? null : safeRatio(itemsAgg._sum.quantity ?? 0, orderCount),
    };
  }

  async getOrderStatusDistribution(range: DateRange): Promise<OrderStatusBreakdown[]> {
    const rows = await this.prismaClient.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: range.from, lt: range.to } },
      _count: { status: true },
    });
    return rows.map((row) => ({ status: row.status, count: row._count.status }));
  }

  // =========================================================================
  // Products
  // =========================================================================

  /** Revenue (`quantity * unitPrice`, summed) is a computed expression
   * `groupBy`'s `_sum` can't express over a single stored column, so
   * this is the one ranking query that needs `$queryRaw` — see this
   * class's doc comment. `reviewCount`/`averageRating` are read from
   * `modules/review`'s own `ReviewRatingSummary` cache via a plain
   * table read (never recomputed), the same "direct read against
   * another module's table" pattern `modules/order`'s
   * `ProductSnapshotRepository` established. */
  async getTopProducts(
    range: DateRange,
    query: ParsedQuery,
  ): Promise<PaginatedResult<ProductPerformance>> {
    const { column, direction } = resolveSortColumn(
      {
        revenue: "revenue",
        unitsSold: "units_sold",
        orderCount: "order_count",
        averageSellingPrice: "average_selling_price",
        reviewCount: "review_count",
        averageRating: "average_rating",
      },
      query.sort,
      "revenue",
    );
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);
    const orderByColumn = Prisma.raw(`"${column}"`);
    const orderByDirection = Prisma.raw(direction);

    const [rows, countRows] = await Promise.all([
      this.prismaClient.$queryRaw<
        Array<{
          product_id: string;
          sku: string;
          product_name: string;
          units_sold: bigint;
          order_count: bigint;
          revenue: bigint;
          average_selling_price: number;
          review_count: number;
          average_rating: number | null;
        }>
      >`
        SELECT ia.product_id,
               ia.sku,
               ia.product_name,
               ia.units_sold,
               ia.order_count,
               ia.revenue,
               ia.average_selling_price,
               COALESCE(rrs.total_reviews, 0) AS review_count,
               rrs.average_rating AS average_rating
        FROM (
          SELECT oi.product_id AS product_id,
                 MAX(oi.sku) AS sku,
                 MAX(oi.product_name) AS product_name,
                 SUM(oi.quantity)::bigint AS units_sold,
                 COUNT(DISTINCT oi.order_id)::bigint AS order_count,
                 SUM(oi.quantity * oi.unit_price)::bigint AS revenue,
                 AVG(oi.unit_price)::float AS average_selling_price
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          WHERE o.created_at >= ${range.from} AND o.created_at < ${range.to}
          GROUP BY oi.product_id
        ) ia
        LEFT JOIN review_rating_summaries rrs ON rrs.product_id = ia.product_id
        ORDER BY ${orderByColumn} ${orderByDirection} NULLS LAST
        LIMIT ${take} OFFSET ${skip}
      `,
      this.prismaClient.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(DISTINCT oi.product_id)::bigint AS total
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.created_at >= ${range.from} AND o.created_at < ${range.to}
      `,
    ]);

    const items: ProductPerformance[] = rows.map((row) => ({
      productId: row.product_id,
      sku: row.sku,
      productName: row.product_name,
      unitsSold: toNumber(row.units_sold),
      orderCount: toNumber(row.order_count),
      revenue: toNumber(row.revenue),
      averageSellingPrice: row.average_selling_price ?? 0,
      reviewCount: toNumber(row.review_count),
      averageRating: row.average_rating,
    }));

    return {
      items,
      meta: buildPaginationMeta(pagination, toNumber(countRows[0]?.total)),
    };
  }

  async getProductCatalogSnapshot(): Promise<ProductCatalogSnapshot> {
    const [totalProducts, activeProducts] = await Promise.all([
      this.prismaClient.product.count({ where: { deletedAt: null } }),
      this.prismaClient.product.count({
        where: { deletedAt: null, status: PRODUCT_STATUS_ACTIVE },
      }),
    ]);
    return { totalProducts, activeProducts };
  }

  // =========================================================================
  // Categories
  // =========================================================================

  /** No `OrderItem` → `Category` relation exists (see
   * `types/category-analytics.types.ts`'s doc comment), so this joins
   * `order_items` to `products` directly by the bare `productId`/
   * `product_id` column both tables already have — a raw SQL join
   * across two modules' tables, the same pattern
   * `modules/order/repository/order.repository.prisma.ts`'s
   * `getAvailableQuantities` already established for reading
   * `inventory_items`. */
  async getCategoryPerformance(
    range: DateRange,
    query: ParsedQuery,
  ): Promise<PaginatedResult<CategoryPerformance>> {
    const { column, direction } = resolveSortColumn(
      { revenue: "revenue", unitsSold: "units_sold", orderCount: "order_count" },
      query.sort,
      "revenue",
    );
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);
    const orderByColumn = Prisma.raw(`"${column}"`);
    const orderByDirection = Prisma.raw(direction);

    const [rows, countRows] = await Promise.all([
      this.prismaClient.$queryRaw<
        Array<{
          category_id: string;
          category_name: string | null;
          units_sold: bigint;
          order_count: bigint;
          revenue: bigint;
        }>
      >`
        SELECT ia.category_id, c.name AS category_name, ia.units_sold, ia.order_count, ia.revenue
        FROM (
          SELECT p.category_id AS category_id,
                 SUM(oi.quantity)::bigint AS units_sold,
                 COUNT(DISTINCT oi.order_id)::bigint AS order_count,
                 SUM(oi.quantity * oi.unit_price)::bigint AS revenue
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          JOIN products p ON p.id = oi.product_id
          WHERE o.created_at >= ${range.from} AND o.created_at < ${range.to} AND p.category_id IS NOT NULL
          GROUP BY p.category_id
        ) ia
        LEFT JOIN categories c ON c.id = ia.category_id
        ORDER BY ${orderByColumn} ${orderByDirection}
        LIMIT ${take} OFFSET ${skip}
      `,
      this.prismaClient.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(DISTINCT p.category_id)::bigint AS total
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        WHERE o.created_at >= ${range.from} AND o.created_at < ${range.to} AND p.category_id IS NOT NULL
      `,
    ]);

    const items: CategoryPerformance[] = rows.map((row) => ({
      categoryId: row.category_id,
      categoryName: row.category_name,
      unitsSold: toNumber(row.units_sold),
      orderCount: toNumber(row.order_count),
      revenue: toNumber(row.revenue),
    }));

    return {
      items,
      meta: buildPaginationMeta(pagination, toNumber(countRows[0]?.total)),
    };
  }

  // =========================================================================
  // Customers
  // =========================================================================

  /** `activeCustomers` (distinct `Order.userId` in range) is the one
   * figure here that genuinely needs a `COUNT(DISTINCT ...)` — Prisma
   * has no native equivalent that avoids materializing every matching
   * row, so this is `$queryRaw`'s one use in this method; everything
   * else is a plain `count()`. */
  async getCustomerSummary(range: DateRange): Promise<CustomerAnalyticsSummary> {
    const [totalCustomers, newCustomers, activeRows] = await Promise.all([
      this.prismaClient.user.count(),
      this.prismaClient.user.count({ where: { createdAt: { gte: range.from, lt: range.to } } }),
      this.prismaClient.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT user_id)::bigint AS count
        FROM orders
        WHERE created_at >= ${range.from} AND created_at < ${range.to} AND user_id IS NOT NULL
      `,
    ]);

    return {
      totalCustomers,
      newCustomers,
      activeCustomers: toNumber(activeRows[0]?.count),
    };
  }

  /** `totalSpent` sums `Order.total` directly (an existing column, not
   * a computed expression) — native `groupBy` with `orderBy`/`skip`/
   * `take` handles ranking and pagination entirely; only the customers'
   * `email`s need a follow-up batched lookup (never one query per
   * row). */
  async getTopCustomers(
    range: DateRange,
    query: ParsedQuery,
  ): Promise<PaginatedResult<CustomerPerformance>> {
    const sortMap: Record<string, "totalSpent" | "orderCount" | "averageOrderValue"> = {
      totalSpent: "totalSpent",
      orderCount: "orderCount",
      averageOrderValue: "averageOrderValue",
    };
    const sortField = sortMap[query.sort[0]?.field ?? ""] ?? "totalSpent";
    const sortOrder = query.sort[0]?.order ?? "desc";
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const where = {
      createdAt: { gte: range.from, lt: range.to },
      userId: { not: null },
    } satisfies Prisma.OrderWhereInput;

    const [groups, distinctCustomers] = await Promise.all([
      this.prismaClient.order.groupBy({
        by: ["userId"],
        where,
        _sum: { total: true },
        _count: { userId: true },
        _avg: { total: true },
        orderBy:
          sortField === "orderCount"
            ? { _count: { userId: sortOrder } }
            : sortField === "averageOrderValue"
              ? { _avg: { total: sortOrder } }
              : { _sum: { total: sortOrder } },
        skip,
        take,
      }),
      this.prismaClient.order.groupBy({ by: ["userId"], where }),
    ]);

    const userIds = groups.map((group) => group.userId).filter((id): id is string => id !== null);
    const users = userIds.length
      ? await this.prismaClient.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true },
        })
      : [];
    const emailById = new Map(users.map((user) => [user.id, user.email]));

    const items: CustomerPerformance[] = groups
      .filter((group): group is typeof group & { userId: string } => group.userId !== null)
      .map((group) => ({
        userId: group.userId,
        email: emailById.get(group.userId) ?? "",
        orderCount: group._count.userId,
        totalSpent: group._sum.total ?? 0,
        averageOrderValue: group._avg.total ?? 0,
      }));

    return {
      items,
      meta: buildPaginationMeta(pagination, distinctCustomers.length),
    };
  }

  // =========================================================================
  // Inventory
  // =========================================================================

  async getInventorySummary(): Promise<InventoryAnalyticsSummary> {
    const [totalItems, lowStockCount, outOfStockCount] = await Promise.all([
      this.prismaClient.inventoryItem.count(),
      this.prismaClient.inventoryItem.count({ where: { status: "low_stock" } }),
      this.prismaClient.inventoryItem.count({ where: { status: "out_of_stock" } }),
    ]);
    return { totalItems, lowStockCount, outOfStockCount };
  }

  async getInventoryMovementSummary(range: DateRange): Promise<InventoryMovementSummary> {
    const rows = await this.prismaClient.inventoryMovement.groupBy({
      by: ["type"],
      where: { createdAt: { gte: range.from, lt: range.to } },
      _count: { type: true },
      _sum: { quantity: true },
    });

    let stockAdditions = 0;
    let stockDeductions = 0;
    let totalMovements = 0;
    const byType = rows.map((row) => {
      const movementCount = row._count.type;
      const totalQuantity = row._sum.quantity ?? 0;
      totalMovements += movementCount;
      if (INVENTORY_MOVEMENT_TYPES_IN.includes(row.type)) {
        stockAdditions += totalQuantity;
      } else if (INVENTORY_MOVEMENT_TYPES_OUT.includes(row.type)) {
        stockDeductions += totalQuantity;
      }
      return { type: row.type, movementCount, totalQuantity };
    });

    return { totalMovements, stockAdditions, stockDeductions, byType };
  }

  /** `groupBy` natively supports `orderBy`/`skip`/`take` on its own
   * aggregates — no raw SQL needed. Only the matching items' `sku`/
   * `warehouseId` need a follow-up batched lookup. */
  async getMostAdjustedInventoryItems(
    range: DateRange,
    query: ParsedQuery,
  ): Promise<PaginatedResult<InventoryAdjustmentRanking>> {
    const sortByQuantity = query.sort[0]?.field === "totalQuantity";
    const sortOrder = query.sort[0]?.order ?? "desc";
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const where = {
      createdAt: { gte: range.from, lt: range.to },
    } satisfies Prisma.InventoryMovementWhereInput;

    const [groups, distinctItems] = await Promise.all([
      this.prismaClient.inventoryMovement.groupBy({
        by: ["inventoryItemId"],
        where,
        _count: { inventoryItemId: true },
        _sum: { quantity: true },
        orderBy: sortByQuantity
          ? { _sum: { quantity: sortOrder } }
          : { _count: { inventoryItemId: sortOrder } },
        skip,
        take,
      }),
      this.prismaClient.inventoryMovement.groupBy({ by: ["inventoryItemId"], where }),
    ]);

    const itemIds = groups.map((group) => group.inventoryItemId);
    const items = itemIds.length
      ? await this.prismaClient.inventoryItem.findMany({
          where: { id: { in: itemIds } },
          select: { id: true, sku: true, warehouseId: true },
        })
      : [];
    const itemById = new Map(items.map((item) => [item.id, item]));

    const rankings: InventoryAdjustmentRanking[] = groups.map((group) => {
      const item = itemById.get(group.inventoryItemId);
      return {
        inventoryItemId: group.inventoryItemId,
        sku: item?.sku ?? "",
        warehouseId: item?.warehouseId ?? "",
        movementCount: group._count.inventoryItemId,
        totalQuantity: group._sum.quantity ?? 0,
      };
    });

    return {
      items: rankings,
      meta: buildPaginationMeta(pagination, distinctItems.length),
    };
  }

  // =========================================================================
  // Coupons
  // =========================================================================

  async getCouponSummary(range: DateRange): Promise<CouponAnalyticsSummary> {
    const [totalCoupons, activeCoupons, redemptionAgg] = await Promise.all([
      this.prismaClient.coupon.count({ where: { deletedAt: null } }),
      this.prismaClient.coupon.count({
        where: { deletedAt: null, status: COUPON_STATUS_ACTIVE },
      }),
      this.prismaClient.couponRedemption.aggregate({
        where: { createdAt: { gte: range.from, lt: range.to }, removedAt: null },
        _count: true,
        _sum: { discountAmount: true },
      }),
    ]);

    return {
      totalCoupons,
      activeCoupons,
      inactiveCoupons: totalCoupons - activeCoupons,
      totalRedemptions: redemptionAgg._count,
      totalDiscountGiven: redemptionAgg._sum.discountAmount ?? 0,
    };
  }

  /** `totalDiscountGiven` sums `discountAmount` directly (an existing
   * column) — native `groupBy` with `orderBy`/`skip`/`take` handles
   * ranking and pagination entirely; only each coupon's `code` needs a
   * follow-up batched lookup. */
  async getTopCoupons(
    range: DateRange,
    query: ParsedQuery,
  ): Promise<PaginatedResult<CouponPerformance>> {
    const sortByDiscount = query.sort[0]?.field === "totalDiscountGiven";
    const sortOrder = query.sort[0]?.order ?? "desc";
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const where = {
      createdAt: { gte: range.from, lt: range.to },
      removedAt: null,
    } satisfies Prisma.CouponRedemptionWhereInput;

    const [groups, distinctCoupons] = await Promise.all([
      this.prismaClient.couponRedemption.groupBy({
        by: ["couponId"],
        where,
        _count: { couponId: true },
        _sum: { discountAmount: true },
        orderBy: sortByDiscount
          ? { _sum: { discountAmount: sortOrder } }
          : { _count: { couponId: sortOrder } },
        skip,
        take,
      }),
      this.prismaClient.couponRedemption.groupBy({ by: ["couponId"], where }),
    ]);

    const couponIds = groups.map((group) => group.couponId);
    const coupons = couponIds.length
      ? await this.prismaClient.coupon.findMany({
          where: { id: { in: couponIds } },
          select: { id: true, code: true },
        })
      : [];
    const codeById = new Map(coupons.map((coupon) => [coupon.id, coupon.code]));

    const items: CouponPerformance[] = groups.map((group) => ({
      couponId: group.couponId,
      code: codeById.get(group.couponId) ?? "",
      redemptionCount: group._count.couponId,
      totalDiscountGiven: group._sum.discountAmount ?? 0,
    }));

    return {
      items,
      meta: buildPaginationMeta(pagination, distinctCoupons.length),
    };
  }

  // =========================================================================
  // Reviews
  // =========================================================================

  async getReviewSummary(range: DateRange): Promise<ReviewAnalyticsSummary> {
    const where = { createdAt: { gte: range.from, lt: range.to }, deletedAt: null };
    const [statusGroups, ratingAgg, ratingGroups] = await Promise.all([
      this.prismaClient.review.groupBy({
        by: ["moderationStatus"],
        where,
        _count: { moderationStatus: true },
      }),
      this.prismaClient.review.aggregate({ where, _avg: { rating: true } }),
      this.prismaClient.review.groupBy({ by: ["rating"], where, _count: { rating: true } }),
    ]);

    const countByStatus = new Map(
      statusGroups.map((row) => [row.moderationStatus, row._count.moderationStatus]),
    );
    const ratingDistribution: RatingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of ratingGroups) {
      if (row.rating >= 1 && row.rating <= 5) {
        ratingDistribution[row.rating as 1 | 2 | 3 | 4 | 5] = row._count.rating;
      }
    }
    const totalReviews = statusGroups.reduce((sum, row) => sum + row._count.moderationStatus, 0);

    return {
      totalReviews,
      approvedReviews: countByStatus.get(REVIEW_STATUS_APPROVED) ?? 0,
      pendingReviews: countByStatus.get(REVIEW_STATUS_PENDING) ?? 0,
      rejectedReviews: countByStatus.get(REVIEW_STATUS_REJECTED) ?? 0,
      flaggedReviews: countByStatus.get(REVIEW_STATUS_FLAGGED) ?? 0,
      averageRating: ratingAgg._avg.rating,
      ratingDistribution,
    };
  }

  /** Native `groupBy` with `orderBy`/`skip`/`take` — no raw SQL needed. */
  async getTopReviewedProducts(
    range: DateRange,
    query: ParsedQuery,
  ): Promise<PaginatedResult<ProductReviewVolume>> {
    const sortByRating = query.sort[0]?.field === "averageRating";
    const sortOrder = query.sort[0]?.order ?? "desc";
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const where = {
      createdAt: { gte: range.from, lt: range.to },
      deletedAt: null,
    } satisfies Prisma.ReviewWhereInput;

    const [groups, distinctProducts] = await Promise.all([
      this.prismaClient.review.groupBy({
        by: ["productId"],
        where,
        _count: { productId: true },
        _avg: { rating: true },
        orderBy: sortByRating
          ? { _avg: { rating: sortOrder } }
          : { _count: { productId: sortOrder } },
        skip,
        take,
      }),
      this.prismaClient.review.groupBy({ by: ["productId"], where }),
    ]);

    const items: ProductReviewVolume[] = groups.map((group) => ({
      productId: group.productId,
      reviewCount: group._count.productId,
      averageRating: group._avg.rating ?? 0,
    }));

    return {
      items,
      meta: buildPaginationMeta(pagination, distinctProducts.length),
    };
  }

  // =========================================================================
  // Payments
  // =========================================================================

  async getPaymentSummary(range: DateRange): Promise<PaymentAnalyticsSummary> {
    const where = { createdAt: { gte: range.from, lt: range.to } };
    const [statusGroups, methodGroups, providerGroups] = await Promise.all([
      this.prismaClient.payment.groupBy({
        by: ["status"],
        where,
        _count: { status: true },
        _sum: { amount: true },
      }),
      this.prismaClient.payment.groupBy({ by: ["method"], where, _count: { method: true } }),
      this.prismaClient.payment.groupBy({ by: ["provider"], where, _count: { provider: true } }),
    ]);

    const countByStatus = new Map(statusGroups.map((row) => [row.status, row._count.status]));

    return {
      statusDistribution: statusGroups.map((row) => ({
        status: row.status,
        count: row._count.status,
        amount: row._sum.amount ?? 0,
      })),
      methodDistribution: methodGroups.map((row) => ({
        method: row.method,
        count: row._count.method,
      })),
      providerDistribution: providerGroups.map((row) => ({
        provider: row.provider,
        count: row._count.provider,
      })),
      successfulCount: countByStatus.get(PAYMENT_STATUS_SUCCEEDED) ?? 0,
      failedCount: countByStatus.get(PAYMENT_STATUS_FAILED) ?? 0,
      pendingCount: countByStatus.get(PAYMENT_STATUS_PENDING) ?? 0,
    };
  }
}
