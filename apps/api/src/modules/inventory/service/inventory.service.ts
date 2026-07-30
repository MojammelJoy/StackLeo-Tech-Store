import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type {
  CreateInventoryItemDto,
  CreateInventoryMovementDto,
  UpdateInventoryItemDto,
} from "../dto";
import type { InventoryFilterOptions } from "../interfaces";
import type { InventoryRepository } from "../repository";
import type { InventoryItem, InventoryMovement } from "../types";

/**
 * Skeleton inventory service — the operations a concrete implementation
 * will expose once inventory persistence exists. Depends on
 * `InventoryRepository` (interface only; see `repository/`), never on
 * Prisma directly, so this class never changes when the persistence
 * layer does. Every method throws `NotImplementedError` — no database
 * operations or business rules (applying a movement's effect to an
 * item's quantity, auto-updating `status` from stock levels, etc.)
 * happen in this foundation.
 *
 * Write operations accept `actor: AuthenticatedUser` — the caller
 * performing the mutation — so a future concrete implementation can
 * attribute changes (audit logging, `createdBy`/`updatedBy`) without
 * every call site's signature changing later. Nothing here checks
 * `actor`'s permissions; that is `modules/rbac`'s job, applied by
 * whatever middleware sits in front of this service once it exists.
 */
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async findById(id: string): Promise<InventoryItem | null> {
    throw new NotImplementedError(`InventoryService.findById is not implemented yet (id: ${id})`);
  }

  async findBySku(sku: string): Promise<InventoryItem | null> {
    throw new NotImplementedError(
      `InventoryService.findBySku is not implemented yet (sku: ${sku})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: InventoryFilterOptions,
  ): Promise<PaginatedResult<InventoryItem>> {
    throw new NotImplementedError("InventoryService.findAll is not implemented yet");
  }

  async create(_dto: CreateInventoryItemDto, _actor: AuthenticatedUser): Promise<InventoryItem> {
    throw new NotImplementedError("InventoryService.create is not implemented yet");
  }

  async update(
    id: string,
    _dto: UpdateInventoryItemDto,
    _actor: AuthenticatedUser,
  ): Promise<InventoryItem> {
    throw new NotImplementedError(`InventoryService.update is not implemented yet (id: ${id})`);
  }

  async delete(id: string, _actor: AuthenticatedUser): Promise<void> {
    throw new NotImplementedError(`InventoryService.delete is not implemented yet (id: ${id})`);
  }

  async recordMovement(
    _dto: CreateInventoryMovementDto,
    _actor: AuthenticatedUser,
  ): Promise<InventoryMovement> {
    throw new NotImplementedError("InventoryService.recordMovement is not implemented yet");
  }
}
