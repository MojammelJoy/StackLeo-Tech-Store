import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import {
  INVENTORY_LOW_STOCK_THRESHOLD_DEFAULT,
  INVENTORY_MOVEMENT_TYPES,
  INVENTORY_STATUSES,
} from "../constants";
import { InventoryConcurrencyError } from "../errors";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { InventoryStatus } from "../constants";
import type { InventoryFilterOptions } from "../interfaces";
import type {
  CreateInventoryItemInput,
  CreateInventoryMovementInput,
  InventoryItem,
  InventoryMovement,
  StockChangeInput,
  TransferStockParams,
  UpdateInventoryItemInput,
} from "../types";
import type { InventoryRepository } from "./inventory.repository";
import type {
  InventoryItem as PrismaInventoryItem,
  InventoryMovement as PrismaInventoryMovement,
  Prisma,
  PrismaClient,
} from "@prisma/client";

/** Prisma's generated model type stores `status` as a plain `string`
 * (it's a `String` column, not a native Postgres enum — see
 * `prisma/schema.prisma`'s doc comment on `InventoryItem`, which
 * mirrors `Product`/`Category`/`Brand`). This is the one place that
 * narrows it back to this module's literal union: every row only ever
 * got there through a Zod-validated DTO or this repository's own
 * derived-status writes, so the cast is safe. */
function toDomainItem(row: PrismaInventoryItem): InventoryItem {
  return { ...row, status: row.status as InventoryStatus };
}

function toDomainItemList(rows: PrismaInventoryItem[]): InventoryItem[] {
  return rows.map(toDomainItem);
}

function toDomainMovement(row: PrismaInventoryMovement): InventoryMovement {
  return { ...row, type: row.type as InventoryMovement["type"] };
}

/**
 * Prisma-backed implementation of `InventoryRepository`. Defaults to
 * the shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class InventoryPrismaRepository implements InventoryRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<InventoryItem | null> {
    const row = await this.prismaClient.inventoryItem.findUnique({ where: { id } });
    return row ? toDomainItem(row) : null;
  }

  async findBySku(sku: string): Promise<InventoryItem | null> {
    const row = await this.prismaClient.inventoryItem.findFirst({ where: { sku } });
    return row ? toDomainItem(row) : null;
  }

  async findBySkuAndWarehouse(sku: string, warehouseId: string): Promise<InventoryItem | null> {
    const row = await this.prismaClient.inventoryItem.findUnique({
      where: { sku_warehouseId: { sku, warehouseId } },
    });
    return row ? toDomainItem(row) : null;
  }

  async findAll(
    query: ParsedQuery,
    filters: InventoryFilterOptions = {},
  ): Promise<PaginatedResult<InventoryItem>> {
    const where = buildWhere(filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.inventoryItem.findMany({ where, orderBy, skip, take }),
      this.prismaClient.inventoryItem.count({ where }),
    ]);

    return {
      items: toDomainItemList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async create(data: CreateInventoryItemInput): Promise<InventoryItem> {
    const initialQuantity = data.quantity ?? 0;

    const created = await this.prismaClient.$transaction(async (tx) => {
      const item = await tx.inventoryItem.create({
        data: {
          sku: data.sku,
          warehouseId: data.warehouseId,
          quantity: initialQuantity,
          reservedQuantity: data.reservedQuantity ?? 0,
          lowStockThreshold: data.lowStockThreshold ?? INVENTORY_LOW_STOCK_THRESHOLD_DEFAULT,
          status: data.status ?? INVENTORY_STATUSES.IN_STOCK,
        },
      });

      if (initialQuantity > 0) {
        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: item.id,
            type: INVENTORY_MOVEMENT_TYPES.STOCK_IN,
            quantity: initialQuantity,
            reason: "Initial stock on item creation",
          },
        });
      }

      return item;
    });

    return toDomainItem(created);
  }

  async update(id: string, data: UpdateInventoryItemInput): Promise<InventoryItem> {
    const row = await this.prismaClient.inventoryItem.update({
      where: { id },
      data: {
        lowStockThreshold: data.lowStockThreshold,
        status: data.status,
      },
    });
    return toDomainItem(row);
  }

  async delete(id: string): Promise<void> {
    await this.prismaClient.inventoryItem.delete({ where: { id } });
  }

  async findOrCreateBySkuAndWarehouse(sku: string, warehouseId: string): Promise<InventoryItem> {
    const row = await this.prismaClient.inventoryItem.upsert({
      where: { sku_warehouseId: { sku, warehouseId } },
      create: { sku, warehouseId },
      update: {},
    });
    return toDomainItem(row);
  }

  async applyStockChange(
    id: string,
    expectedVersion: number,
    changes: StockChangeInput,
    movement: Omit<CreateInventoryMovementInput, "inventoryItemId">,
  ): Promise<InventoryItem> {
    const updated = await this.prismaClient.$transaction(async (tx) => {
      const result = await tx.inventoryItem.updateMany({
        where: { id, version: expectedVersion },
        data: {
          quantity: changes.quantity,
          reservedQuantity: changes.reservedQuantity,
          status: changes.status,
          version: { increment: 1 },
        },
      });

      if (result.count === 0) {
        throw new InventoryConcurrencyError();
      }

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: id,
          type: movement.type,
          quantity: movement.quantity,
          reason: movement.reason ?? null,
          relatedItemId: movement.relatedItemId ?? null,
        },
      });

      return tx.inventoryItem.findUniqueOrThrow({ where: { id } });
    });

    return toDomainItem(updated);
  }

  async transferStock(
    params: TransferStockParams,
  ): Promise<{ source: InventoryItem; destination: InventoryItem }> {
    const { source, destination } = await this.prismaClient.$transaction(async (tx) => {
      const sourceResult = await tx.inventoryItem.updateMany({
        where: { id: params.source.id, version: params.source.expectedVersion },
        data: {
          quantity: params.source.newQuantity,
          status: params.source.newStatus,
          version: { increment: 1 },
        },
      });
      if (sourceResult.count === 0) {
        throw new InventoryConcurrencyError("Source inventory item was modified concurrently");
      }

      const destinationResult = await tx.inventoryItem.updateMany({
        where: { id: params.destination.id, version: params.destination.expectedVersion },
        data: {
          quantity: params.destination.newQuantity,
          status: params.destination.newStatus,
          version: { increment: 1 },
        },
      });
      if (destinationResult.count === 0) {
        throw new InventoryConcurrencyError("Destination inventory item was modified concurrently");
      }

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: params.source.id,
          type: INVENTORY_MOVEMENT_TYPES.TRANSFER_OUT,
          quantity: params.quantity,
          reason: params.reason ?? null,
          relatedItemId: params.destination.id,
        },
      });
      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: params.destination.id,
          type: INVENTORY_MOVEMENT_TYPES.TRANSFER_IN,
          quantity: params.quantity,
          reason: params.reason ?? null,
          relatedItemId: params.source.id,
        },
      });

      const [sourceRow, destinationRow] = await Promise.all([
        tx.inventoryItem.findUniqueOrThrow({ where: { id: params.source.id } }),
        tx.inventoryItem.findUniqueOrThrow({ where: { id: params.destination.id } }),
      ]);

      return { source: sourceRow, destination: destinationRow };
    });

    return { source: toDomainItem(source), destination: toDomainItem(destination) };
  }

  async findMovementsByItemId(
    inventoryItemId: string,
    query: ParsedQuery,
  ): Promise<PaginatedResult<InventoryMovement>> {
    const where: Prisma.InventoryMovementWhereInput = { inventoryItemId };
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.inventoryMovement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prismaClient.inventoryMovement.count({ where }),
    ]);

    return {
      items: rows.map(toDomainMovement),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }
}

function buildWhere(
  filters: InventoryFilterOptions,
  search?: string,
): Prisma.InventoryItemWhereInput {
  const conditions: Prisma.InventoryItemWhereInput[] = [];

  if (filters.warehouseId) {
    conditions.push({ warehouseId: filters.warehouseId });
  }
  if (filters.status) {
    conditions.push({ status: filters.status });
  }
  if (filters.sku) {
    conditions.push({ sku: filters.sku });
  }

  if (search) {
    conditions.push({ sku: { contains: search, mode: "insensitive" } });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

/** Always appends an `id` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring
 * `modules/product`/`modules/category`/`modules/brand`. */
function buildOrderBy(sort: SortParam[]): Prisma.InventoryItemOrderByWithRelationInput[] {
  if (sort.length === 0) {
    return [{ createdAt: "desc" }, { id: "asc" }];
  }
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
