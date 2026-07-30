import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { InventoryFilterOptions } from "../interfaces";
import type {
  CreateInventoryItemInput,
  CreateInventoryMovementInput,
  InventoryItem,
  InventoryMovement,
  UpdateInventoryItemInput,
} from "../types";
import type { InventoryRepository } from "./inventory.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `InventoryRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `InventoryItem`/`InventoryMovement`
 * model exists in `prisma/schema.prisma` yet; adding one is out of
 * scope for this foundation. Defaults to the shared `prisma` client
 * from `database/` (never constructs its own connection) so only the
 * method bodies are left to fill in once a model exists.
 */
export class InventoryPrismaRepository implements InventoryRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<InventoryItem | null> {
    throw new NotImplementedError(
      `InventoryPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findBySku(sku: string): Promise<InventoryItem | null> {
    throw new NotImplementedError(
      `InventoryPrismaRepository.findBySku is not implemented yet (sku: ${sku})`,
    );
  }

  async findBySkuAndWarehouse(sku: string, warehouseId: string): Promise<InventoryItem | null> {
    throw new NotImplementedError(
      `InventoryPrismaRepository.findBySkuAndWarehouse is not implemented yet (sku: ${sku}, warehouseId: ${warehouseId})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: InventoryFilterOptions,
  ): Promise<PaginatedResult<InventoryItem>> {
    throw new NotImplementedError("InventoryPrismaRepository.findAll is not implemented yet");
  }

  async create(_data: CreateInventoryItemInput): Promise<InventoryItem> {
    throw new NotImplementedError("InventoryPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateInventoryItemInput): Promise<InventoryItem> {
    throw new NotImplementedError(
      `InventoryPrismaRepository.update is not implemented yet (id: ${id})`,
    );
  }

  async delete(id: string): Promise<void> {
    throw new NotImplementedError(
      `InventoryPrismaRepository.delete is not implemented yet (id: ${id})`,
    );
  }

  async recordMovement(_data: CreateInventoryMovementInput): Promise<InventoryMovement> {
    throw new NotImplementedError(
      "InventoryPrismaRepository.recordMovement is not implemented yet",
    );
  }

  async findMovementsByItemId(
    inventoryItemId: string,
    _query: ParsedQuery,
  ): Promise<PaginatedResult<InventoryMovement>> {
    throw new NotImplementedError(
      `InventoryPrismaRepository.findMovementsByItemId is not implemented yet (inventoryItemId: ${inventoryItemId})`,
    );
  }
}
