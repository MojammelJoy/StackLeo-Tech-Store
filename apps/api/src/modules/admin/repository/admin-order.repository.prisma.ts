import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { formatOrderNumber } from "../../order";

import type { AdminOrderRepository } from "./admin-order.repository";
import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type {
  AddressSnapshot,
  FulfillmentStatus,
  Order,
  OrderFilterOptions,
  OrderStatus,
  PaymentStatus,
} from "../../order";
import type { Order as PrismaOrder, Prisma, PrismaClient } from "@prisma/client";

/** Mirrors `modules/order/repository/order.repository.prisma.ts`'s
 * private `toDomainOrder` exactly (that function isn't exported — this
 * module never imports another module's internals, only its public
 * types/constants/services) — every row only ever got there through
 * that module's own repository, so the same cast back is safe here. */
function toDomainOrder(row: PrismaOrder): Order {
  return {
    ...row,
    orderNumber: formatOrderNumber(row.sequenceNumber),
    status: row.status as OrderStatus,
    paymentStatus: row.paymentStatus as PaymentStatus,
    fulfillmentStatus: row.fulfillmentStatus as FulfillmentStatus,
    billingAddress: row.billingAddress as unknown as AddressSnapshot,
    shippingAddress: row.shippingAddress as unknown as AddressSnapshot,
  };
}

/**
 * Prisma-backed implementation of `AdminOrderRepository`. Defaults to
 * the shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class AdminOrderPrismaRepository implements AdminOrderRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findAll(
    query: ParsedQuery,
    filters: OrderFilterOptions = {},
  ): Promise<PaginatedResult<Order>> {
    const where = buildWhere(filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.order.findMany({ where, orderBy, skip, take }),
      this.prismaClient.order.count({ where }),
    ]);

    return {
      items: rows.map(toDomainOrder),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }
}

function buildWhere(filters: OrderFilterOptions, search?: string): Prisma.OrderWhereInput {
  const conditions: Prisma.OrderWhereInput[] = [];

  if (filters.status) {
    conditions.push({ status: filters.status });
  }
  if (filters.paymentStatus) {
    conditions.push({ paymentStatus: filters.paymentStatus });
  }
  if (filters.fulfillmentStatus) {
    conditions.push({ fulfillmentStatus: filters.fulfillmentStatus });
  }

  if (search) {
    conditions.push({ notes: { contains: search, mode: "insensitive" } });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

/** Always appends an `id` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring every other
 * module's Prisma repository. */
function buildOrderBy(sort: SortParam[]): Prisma.OrderOrderByWithRelationInput[] {
  if (sort.length === 0) {
    return [{ createdAt: "desc" }, { id: "asc" }];
  }
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
