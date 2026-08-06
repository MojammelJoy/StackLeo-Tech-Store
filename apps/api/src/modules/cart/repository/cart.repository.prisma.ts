import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { NotFoundError } from "../../../errors";
import { CART_STATUSES } from "../constants";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { CartStatus } from "../constants";
import type { CartFilterOptions } from "../interfaces";
import type {
  Cart,
  CartItem,
  CreateCartInput,
  CreateCartItemInput,
  MergeCartItemsParams,
  UpdateCartInput,
  UpdateCartItemInput,
} from "../types";
import type { CartRepository } from "./cart.repository";
import type {
  Cart as PrismaCart,
  CartItem as PrismaCartItem,
  Prisma,
  PrismaClient,
} from "@prisma/client";

/** Prisma's generated model type stores `status` as a plain `string`
 * (a `String` column, not a native Postgres enum — see
 * `prisma/schema.prisma`'s doc comment on `Cart`, which mirrors
 * `Product`/`Category`/`Brand`/`InventoryItem`/`MediaAsset`). This is
 * the one place that narrows it back to this module's literal union:
 * every row only ever got there through this repository, so the cast
 * is safe. */
function toDomainCart(row: PrismaCart): Cart {
  return { ...row, status: row.status as CartStatus };
}

function toDomainCartList(rows: PrismaCart[]): Cart[] {
  return rows.map(toDomainCart);
}

function toDomainCartItem(row: PrismaCartItem): CartItem {
  return { ...row };
}

function toDomainCartItemList(rows: PrismaCartItem[]): CartItem[] {
  return rows.map(toDomainCartItem);
}

/**
 * Prisma-backed implementation of `CartRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class CartPrismaRepository implements CartRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Cart | null> {
    const row = await this.prismaClient.cart.findUnique({ where: { id } });
    return row ? toDomainCart(row) : null;
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    const row = await this.prismaClient.cart.findFirst({
      where: { userId, status: CART_STATUSES.ACTIVE },
      orderBy: { createdAt: "desc" },
    });
    return row ? toDomainCart(row) : null;
  }

  async findByGuestToken(guestToken: string): Promise<Cart | null> {
    const row = await this.prismaClient.cart.findFirst({
      where: { guestToken, status: CART_STATUSES.ACTIVE },
    });
    return row ? toDomainCart(row) : null;
  }

  async findAll(
    query: ParsedQuery,
    filters: CartFilterOptions = {},
  ): Promise<PaginatedResult<Cart>> {
    const where = buildWhere(filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.cart.findMany({ where, orderBy, skip, take }),
      this.prismaClient.cart.count({ where }),
    ]);

    return {
      items: toDomainCartList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async create(data: CreateCartInput): Promise<Cart> {
    const row = await this.prismaClient.cart.create({
      data: {
        userId: data.userId ?? null,
        guestToken: data.guestToken ?? null,
        currency: data.currency,
        status: data.status ?? CART_STATUSES.ACTIVE,
      },
    });
    return toDomainCart(row);
  }

  async update(id: string, data: UpdateCartInput): Promise<Cart> {
    const row = await this.prismaClient.cart.update({
      where: { id },
      data: { status: data.status },
    });
    return toDomainCart(row);
  }

  async delete(id: string): Promise<void> {
    await this.prismaClient.cart.delete({ where: { id } });
  }

  async findItemsByCartId(cartId: string): Promise<CartItem[]> {
    const rows = await this.prismaClient.cartItem.findMany({
      where: { cartId },
      orderBy: { createdAt: "asc" },
    });
    return toDomainCartItemList(rows);
  }

  async findItemsByCartIds(cartIds: string[]): Promise<CartItem[]> {
    if (cartIds.length === 0) {
      return [];
    }
    const rows = await this.prismaClient.cartItem.findMany({
      where: { cartId: { in: cartIds } },
      orderBy: { createdAt: "asc" },
    });
    return toDomainCartItemList(rows);
  }

  async findItemById(itemId: string): Promise<CartItem | null> {
    const row = await this.prismaClient.cartItem.findUnique({ where: { id: itemId } });
    return row ? toDomainCartItem(row) : null;
  }

  async findItemByCartAndProduct(cartId: string, productId: string): Promise<CartItem | null> {
    const row = await this.prismaClient.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
    });
    return row ? toDomainCartItem(row) : null;
  }

  async addItem(data: CreateCartItemInput): Promise<CartItem> {
    const row = await this.prismaClient.cartItem.upsert({
      where: { cartId_productId: { cartId: data.cartId, productId: data.productId } },
      create: {
        cartId: data.cartId,
        productId: data.productId,
        sku: data.sku,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        selected: data.selected ?? true,
      },
      update: {
        sku: data.sku,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
      },
    });
    return toDomainCartItem(row);
  }

  async updateItem(itemId: string, data: UpdateCartItemInput): Promise<CartItem> {
    const row = await this.prismaClient.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity, selected: data.selected },
    });
    return toDomainCartItem(row);
  }

  async removeItem(itemId: string): Promise<void> {
    await this.prismaClient.cartItem.delete({ where: { id: itemId } });
  }

  async clearItems(cartId: string): Promise<void> {
    await this.prismaClient.cartItem.deleteMany({ where: { cartId } });
  }

  async mergeItemsIntoCart(params: MergeCartItemsParams): Promise<Cart> {
    const merged = await this.prismaClient.$transaction(async (tx) => {
      for (const item of params.items) {
        await tx.cartItem.upsert({
          where: { cartId_productId: { cartId: params.targetCartId, productId: item.productId } },
          create: {
            cartId: params.targetCartId,
            productId: item.productId,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
          update: {
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      }

      await tx.cart.update({
        where: { id: params.guestCartId },
        data: { status: CART_STATUSES.MERGED },
      });

      return tx.cart.findUnique({ where: { id: params.targetCartId } });
    });

    if (!merged) {
      throw new NotFoundError("Target cart not found after merge");
    }
    return toDomainCart(merged);
  }
}

function buildWhere(filters: CartFilterOptions, search?: string): Prisma.CartWhereInput {
  const conditions: Prisma.CartWhereInput[] = [];

  if (filters.userId) {
    conditions.push({ userId: filters.userId });
  }
  if (filters.status) {
    conditions.push({ status: filters.status });
  }

  if (search) {
    conditions.push({
      OR: [
        { userId: { contains: search, mode: "insensitive" } },
        { guestToken: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

/** Always appends an `id` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring every other
 * module's Prisma repository. */
function buildOrderBy(sort: SortParam[]): Prisma.CartOrderByWithRelationInput[] {
  if (sort.length === 0) return [{ createdAt: "desc" }, { id: "asc" }];
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
