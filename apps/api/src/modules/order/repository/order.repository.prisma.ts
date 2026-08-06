import { Prisma } from "@prisma/client";

import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { ConflictError } from "../../../errors";
import { FULFILLMENT_STATUSES, ORDER_STATUSES, PAYMENT_STATUSES } from "../constants";
import { formatOrderNumber, parseOrderNumber } from "../utils";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { FulfillmentStatus, OrderStatus, PaymentStatus } from "../constants";
import type { OrderFilterOptions } from "../interfaces";
import type {
  AddressSnapshot,
  CreateOrderInput,
  Order,
  OrderItem,
  OrderStatusHistoryEntry,
  UpdateOrderInput,
} from "../types";
import type { OrderRepository } from "./order.repository";
import type {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderStatusHistory as PrismaOrderStatusHistory,
  Prisma as PrismaNamespace,
  PrismaClient,
} from "@prisma/client";

/** Prisma's generated model type stores `status`/`paymentStatus`/
 * `fulfillmentStatus` as plain `string` (they're `String` columns, not
 * native Postgres enums — see `prisma/schema.prisma`'s doc comment on
 * `Order`, which mirrors `Product`/`Cart`/`Wishlist`/`Address`). This is
 * the one place that narrows them back to this module's literal
 * unions, and derives the customer-facing `orderNumber` from the
 * stored `sequenceNumber` — every row only ever got there through this
 * repository, so both are safe. */
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

function toDomainOrderList(rows: PrismaOrder[]): Order[] {
  return rows.map(toDomainOrder);
}

function toDomainOrderItem(row: PrismaOrderItem): OrderItem {
  return { ...row };
}

function toDomainOrderItemList(rows: PrismaOrderItem[]): OrderItem[] {
  return rows.map(toDomainOrderItem);
}

function toDomainHistoryEntry(row: PrismaOrderStatusHistory): OrderStatusHistoryEntry {
  return { ...row, status: row.status as OrderStatus };
}

/**
 * Prisma-backed implementation of `OrderRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class OrderPrismaRepository implements OrderRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Order | null> {
    const row = await this.prismaClient.order.findUnique({ where: { id } });
    return row ? toDomainOrder(row) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const sequenceNumber = parseOrderNumber(orderNumber);
    if (sequenceNumber === null) {
      return null;
    }
    const row = await this.prismaClient.order.findUnique({ where: { sequenceNumber } });
    return row ? toDomainOrder(row) : null;
  }

  async findByUserId(
    userId: string,
    query: ParsedQuery,
    filters: OrderFilterOptions = {},
  ): Promise<PaginatedResult<Order>> {
    return this.findMany({ userId }, query, filters);
  }

  async findByGuestEmail(
    guestEmail: string,
    query: ParsedQuery,
    filters: OrderFilterOptions = {},
  ): Promise<PaginatedResult<Order>> {
    return this.findMany({ guestEmail }, query, filters);
  }

  private async findMany(
    identity: PrismaNamespace.OrderWhereInput,
    query: ParsedQuery,
    filters: OrderFilterOptions,
  ): Promise<PaginatedResult<Order>> {
    const where = buildWhere(identity, filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.order.findMany({ where, orderBy, skip, take }),
      this.prismaClient.order.count({ where }),
    ]);

    return {
      items: toDomainOrderList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  /**
   * Atomically deducts inventory for every item (`deductInventory`,
   * throwing `ConflictError` — and rolling back everything below — if
   * any SKU's stock is insufficient or changed concurrently since
   * `OrderService.placeOrder`'s own pre-check), then creates the order
   * row, its `OrderItem` rows, and its initial `OrderStatusHistory`
   * entry, all in one `$transaction`. This is "Deduct inventory using
   * Prisma transactions" and "Store product snapshot inside order
   * items" in their strongest, most correct form: the order and the
   * stock movement it depends on either both happen or neither does —
   * there is no window where one exists without the other.
   */
  async create(data: CreateOrderInput): Promise<Order> {
    const status = data.status ?? ORDER_STATUSES.PENDING;

    const created = await this.prismaClient.$transaction(async (tx) => {
      for (const item of data.items) {
        await this.deductInventory(tx, item.sku, item.quantity);
      }

      return tx.order.create({
        data: {
          userId: data.userId ?? null,
          guestEmail: data.guestEmail ?? null,
          status,
          paymentStatus: data.paymentStatus ?? PAYMENT_STATUSES.PENDING,
          fulfillmentStatus: data.fulfillmentStatus ?? FULFILLMENT_STATUSES.UNFULFILLED,
          billingAddressId: data.billingAddressId,
          shippingAddressId: data.shippingAddressId,
          billingAddress: data.billingAddress as unknown as PrismaNamespace.InputJsonValue,
          shippingAddress: data.shippingAddress as unknown as PrismaNamespace.InputJsonValue,
          couponCode: data.couponCode ?? null,
          notes: data.notes ?? null,
          currency: data.currency,
          subtotal: data.subtotal,
          discountTotal: data.discountTotal ?? 0,
          taxTotal: data.taxTotal ?? 0,
          shippingTotal: data.shippingTotal ?? 0,
          total: data.total,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              sku: item.sku,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
          statusHistory: {
            create: { status, note: null },
          },
        },
      });
    });

    return toDomainOrder(created);
  }

  async update(id: string, data: UpdateOrderInput): Promise<Order> {
    const row = await this.prismaClient.order.update({
      where: { id },
      data: { notes: data.notes },
    });
    return toDomainOrder(row);
  }

  async updateStatus(id: string, status: OrderStatus, note?: string | null): Promise<Order> {
    const updated = await this.prismaClient.$transaction(async (tx) => {
      const order = await tx.order.update({ where: { id }, data: { status } });
      await tx.orderStatusHistory.create({ data: { orderId: id, status, note: note ?? null } });
      return order;
    });
    return toDomainOrder(updated);
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Order> {
    const row = await this.prismaClient.order.update({
      where: { id },
      data: { paymentStatus: status },
    });
    return toDomainOrder(row);
  }

  async updateFulfillmentStatus(id: string, status: FulfillmentStatus): Promise<Order> {
    const row = await this.prismaClient.order.update({
      where: { id },
      data: { fulfillmentStatus: status },
    });
    return toDomainOrder(row);
  }

  async findItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    const rows = await this.prismaClient.orderItem.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    });
    return toDomainOrderItemList(rows);
  }

  async findItemsByOrderIds(orderIds: string[]): Promise<OrderItem[]> {
    if (orderIds.length === 0) {
      return [];
    }
    const rows = await this.prismaClient.orderItem.findMany({
      where: { orderId: { in: orderIds } },
      orderBy: { createdAt: "asc" },
    });
    return toDomainOrderItemList(rows);
  }

  async findTimelineByOrderId(orderId: string): Promise<OrderStatusHistoryEntry[]> {
    const rows = await this.prismaClient.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toDomainHistoryEntry);
  }

  async getAvailableQuantities(skus: string[]): Promise<Map<string, number>> {
    const available = new Map<string, number>(skus.map((sku) => [sku, 0]));
    if (skus.length === 0) {
      return available;
    }

    const rows = await this.prismaClient.$queryRaw<
      Array<{ sku: string; available: bigint | null }>
    >`
      SELECT sku, SUM(quantity - reserved_quantity)::bigint AS available
      FROM inventory_items
      WHERE sku IN (${Prisma.join(skus)})
      GROUP BY sku
    `;
    for (const row of rows) {
      const quantity = Number(row.available ?? 0);
      available.set(row.sku, Number.isFinite(quantity) && quantity > 0 ? quantity : 0);
    }
    return available;
  }

  /** Greedily deducts `quantity` of `sku` from whichever
   * `InventoryItem` (warehouse) rows have it available, guarding each
   * row's update on the exact `quantity`/`reservedQuantity` values just
   * read from it (an inline optimistic-concurrency check — see
   * `modules/inventory`'s `version`-based equivalent for the same
   * idea applied to its own direct mutation API). A guard mismatch
   * (`count === 0`, meaning another transaction changed the row between
   * this read and write) or running out of rows before `quantity` is
   * fully satisfied both throw `ConflictError`, rolling back the whole
   * `create` transaction — never a partial deduction. */
  private async deductInventory(
    tx: PrismaNamespace.TransactionClient,
    sku: string,
    quantity: number,
  ): Promise<void> {
    let remaining = quantity;
    const rows = await tx.inventoryItem.findMany({ where: { sku }, orderBy: { id: "asc" } });

    for (const row of rows) {
      if (remaining <= 0) break;

      const rowAvailable = row.quantity - row.reservedQuantity;
      if (rowAvailable <= 0) continue;

      const deduct = Math.min(rowAvailable, remaining);
      const result = await tx.inventoryItem.updateMany({
        where: { id: row.id, quantity: row.quantity, reservedQuantity: row.reservedQuantity },
        data: { quantity: { decrement: deduct } },
      });

      if (result.count === 0) {
        throw new ConflictError(
          `Inventory for SKU "${sku}" changed concurrently — please try again`,
        );
      }
      remaining -= deduct;
    }

    if (remaining > 0) {
      throw new ConflictError(`Insufficient stock for SKU "${sku}"`);
    }
  }
}

function buildWhere(
  identity: PrismaNamespace.OrderWhereInput,
  filters: OrderFilterOptions,
  search?: string,
): PrismaNamespace.OrderWhereInput {
  const conditions: PrismaNamespace.OrderWhereInput[] = [identity];

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

  return { AND: conditions };
}

/** Always appends an `id` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring every other
 * module's Prisma repository. */
function buildOrderBy(sort: SortParam[]): PrismaNamespace.OrderOrderByWithRelationInput[] {
  if (sort.length === 0) return [{ createdAt: "desc" }, { id: "asc" }];
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
