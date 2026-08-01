import { BadRequestError, ConflictError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";
import {
  INVENTORY_MAX_OPTIMISTIC_RETRY_ATTEMPTS,
  INVENTORY_MOVEMENT_TYPES,
  INVENTORY_STATUSES,
} from "../constants";
import { InventoryConcurrencyError } from "../errors";
import { getAvailableQuantity, inventoryMapper, resolveStockStatus } from "../mapper";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { InventoryStatus } from "../constants";
import type {
  AdjustStockDto,
  CreateInventoryItemDto,
  DecreaseStockDto,
  IncreaseStockDto,
  InventoryItemResponseDto,
  InventoryMovementResponseDto,
  ReleaseStockDto,
  ReserveStockDto,
  TransferStockDto,
  TransferStockResponseDto,
  UpdateInventoryItemDto,
} from "../dto";
import type { InventoryFilterOptions } from "../interfaces";
import type { InventoryRepository } from "../repository";
import type { InventoryItem } from "../types";

/**
 * Implements every Inventory API operation: CRUD (create/update — no
 * delete/restore; see the module's index.ts doc comment for why),
 * stock mutations (increase/decrease/reserve/release/adjust/transfer),
 * movement history, and listing (pagination, filtering, sorting,
 * search). Depends on `InventoryRepository` (interface only; see
 * `repository/`), never on Prisma directly.
 *
 * Unlike `modules/product`/`modules/category`/`modules/brand`, there is
 * no `actor: AuthenticatedUser | null` visibility-scoping parameter on
 * read methods here: inventory data has no public/private distinction
 * at all (see `PERMISSIONS.INVENTORY_READ`'s doc comment) — every
 * endpoint, read or write, is gated by `authenticate` +
 * `requirePermission` at the route layer, so by the time a request
 * reaches this service it's already known to be allowed. Write methods
 * still take `actor: AuthenticatedUser` to attribute changes in logs.
 *
 * Every quantity-affecting method (`increaseStock`/`decreaseStock`/
 * `reserveStock`/`releaseStock`/`adjustStock`/`transferStock`) follows
 * the same shape: read the current item, validate the operation against
 * *that* read (negative-stock prevention), compute the new values, and
 * hand them to `InventoryRepository.applyStockChange`/`transferStock`
 * — which conditions its write on the item's `version` still matching.
 * If it doesn't (another mutation won the race), the repository throws
 * `InventoryConcurrencyError` and `withOptimisticRetry` reruns the
 * whole read-validate-compute-write cycle against fresh state, up to
 * `INVENTORY_MAX_OPTIMISTIC_RETRY_ATTEMPTS` times.
 */
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async list(
    query: ParsedQuery,
    filters: InventoryFilterOptions,
  ): Promise<PaginatedResult<InventoryItemResponseDto>> {
    const result = await this.inventoryRepository.findAll(query, filters);
    return { items: inventoryMapper.toResponseList(result.items), meta: result.meta };
  }

  async getById(id: string): Promise<InventoryItemResponseDto> {
    const item = await this.getExistingItem(id);
    return inventoryMapper.toResponseDto(item);
  }

  async getBySku(sku: string, warehouseId?: string): Promise<InventoryItemResponseDto> {
    const item = warehouseId
      ? await this.inventoryRepository.findBySkuAndWarehouse(sku, warehouseId)
      : await this.inventoryRepository.findBySku(sku);
    if (!item) {
      throw new NotFoundError("Inventory item not found");
    }
    return inventoryMapper.toResponseDto(item);
  }

  async getMovementHistory(
    id: string,
    query: ParsedQuery,
  ): Promise<PaginatedResult<InventoryMovementResponseDto>> {
    await this.getExistingItem(id);
    const result = await this.inventoryRepository.findMovementsByItemId(id, query);
    return { items: inventoryMapper.toMovementResponseList(result.items), meta: result.meta };
  }

  async create(
    dto: CreateInventoryItemDto,
    actor: AuthenticatedUser,
  ): Promise<InventoryItemResponseDto> {
    const existing = await this.inventoryRepository.findBySkuAndWarehouse(dto.sku, dto.warehouseId);
    if (existing) {
      throw new ConflictError(
        `An inventory record for SKU "${dto.sku}" already exists at warehouse "${dto.warehouseId}"`,
      );
    }

    const item = await this.inventoryRepository.create(dto);
    logger.info(
      { inventoryItemId: item.id, sku: dto.sku, warehouseId: dto.warehouseId, actorId: actor.id },
      "Inventory item created",
    );
    return inventoryMapper.toResponseDto(item);
  }

  async update(
    id: string,
    dto: UpdateInventoryItemDto,
    actor: AuthenticatedUser,
  ): Promise<InventoryItemResponseDto> {
    await this.getExistingItem(id);
    const updated = await this.inventoryRepository.update(id, dto);
    logger.info({ inventoryItemId: id, actorId: actor.id }, "Inventory item updated");
    return inventoryMapper.toResponseDto(updated);
  }

  async increaseStock(
    id: string,
    dto: IncreaseStockDto,
    actor: AuthenticatedUser,
  ): Promise<InventoryItemResponseDto> {
    const updated = await this.withOptimisticRetry(async () => {
      const item = await this.getExistingItem(id);
      const newQuantity = item.quantity + dto.quantity;
      const newStatus = this.deriveStatus(item, newQuantity, item.reservedQuantity);

      return this.inventoryRepository.applyStockChange(
        id,
        item.version,
        { quantity: newQuantity, status: newStatus },
        {
          type: INVENTORY_MOVEMENT_TYPES.STOCK_IN,
          quantity: dto.quantity,
          reason: dto.reason ?? null,
        },
      );
    });

    logger.info(
      { inventoryItemId: id, quantity: dto.quantity, actorId: actor.id },
      "Inventory stock increased",
    );
    return inventoryMapper.toResponseDto(updated);
  }

  async decreaseStock(
    id: string,
    dto: DecreaseStockDto,
    actor: AuthenticatedUser,
  ): Promise<InventoryItemResponseDto> {
    const updated = await this.withOptimisticRetry(async () => {
      const item = await this.getExistingItem(id);
      const newQuantity = item.quantity - dto.quantity;

      if (newQuantity < item.reservedQuantity) {
        throw new ConflictError(
          `Cannot decrease stock by ${dto.quantity}: only ${getAvailableQuantity(item)} unit(s) are available (the rest is already reserved)`,
        );
      }

      const newStatus = this.deriveStatus(item, newQuantity, item.reservedQuantity);

      return this.inventoryRepository.applyStockChange(
        id,
        item.version,
        { quantity: newQuantity, status: newStatus },
        {
          type: INVENTORY_MOVEMENT_TYPES.STOCK_OUT,
          quantity: dto.quantity,
          reason: dto.reason ?? null,
        },
      );
    });

    logger.info(
      { inventoryItemId: id, quantity: dto.quantity, actorId: actor.id },
      "Inventory stock decreased",
    );
    return inventoryMapper.toResponseDto(updated);
  }

  async reserveStock(
    id: string,
    dto: ReserveStockDto,
    actor: AuthenticatedUser,
  ): Promise<InventoryItemResponseDto> {
    const updated = await this.withOptimisticRetry(async () => {
      const item = await this.getExistingItem(id);
      const newReserved = item.reservedQuantity + dto.quantity;

      if (newReserved > item.quantity) {
        throw new ConflictError(
          `Cannot reserve ${dto.quantity} unit(s): only ${getAvailableQuantity(item)} available`,
        );
      }

      const newStatus = this.deriveStatus(item, item.quantity, newReserved);

      return this.inventoryRepository.applyStockChange(
        id,
        item.version,
        { reservedQuantity: newReserved, status: newStatus },
        {
          type: INVENTORY_MOVEMENT_TYPES.RESERVATION,
          quantity: dto.quantity,
          reason: dto.reason ?? null,
        },
      );
    });

    logger.info(
      { inventoryItemId: id, quantity: dto.quantity, actorId: actor.id },
      "Inventory stock reserved",
    );
    return inventoryMapper.toResponseDto(updated);
  }

  async releaseStock(
    id: string,
    dto: ReleaseStockDto,
    actor: AuthenticatedUser,
  ): Promise<InventoryItemResponseDto> {
    const updated = await this.withOptimisticRetry(async () => {
      const item = await this.getExistingItem(id);

      if (dto.quantity > item.reservedQuantity) {
        throw new ConflictError(
          `Cannot release ${dto.quantity} unit(s): only ${item.reservedQuantity} currently reserved`,
        );
      }

      const newReserved = item.reservedQuantity - dto.quantity;
      const newStatus = this.deriveStatus(item, item.quantity, newReserved);

      return this.inventoryRepository.applyStockChange(
        id,
        item.version,
        { reservedQuantity: newReserved, status: newStatus },
        {
          type: INVENTORY_MOVEMENT_TYPES.RELEASE,
          quantity: dto.quantity,
          reason: dto.reason ?? null,
        },
      );
    });

    logger.info(
      { inventoryItemId: id, quantity: dto.quantity, actorId: actor.id },
      "Inventory reserved stock released",
    );
    return inventoryMapper.toResponseDto(updated);
  }

  /** `dto.quantity` is the new *absolute* stock level (a physical-count
   * correction), not a delta — see `validation/adjust-stock.schema.ts`. */
  async adjustStock(
    id: string,
    dto: AdjustStockDto,
    actor: AuthenticatedUser,
  ): Promise<InventoryItemResponseDto> {
    const updated = await this.withOptimisticRetry(async () => {
      const item = await this.getExistingItem(id);

      if (dto.quantity === item.quantity) {
        return item;
      }
      if (dto.quantity < item.reservedQuantity) {
        throw new ConflictError(
          `Cannot adjust stock to ${dto.quantity}: ${item.reservedQuantity} unit(s) are already reserved`,
        );
      }

      const delta = Math.abs(dto.quantity - item.quantity);
      const newStatus = this.deriveStatus(item, dto.quantity, item.reservedQuantity);

      return this.inventoryRepository.applyStockChange(
        id,
        item.version,
        { quantity: dto.quantity, status: newStatus },
        { type: INVENTORY_MOVEMENT_TYPES.ADJUSTMENT, quantity: delta, reason: dto.reason ?? null },
      );
    });

    logger.info(
      { inventoryItemId: id, newQuantity: dto.quantity, actorId: actor.id },
      "Inventory stock adjusted",
    );
    return inventoryMapper.toResponseDto(updated);
  }

  async transferStock(
    sourceId: string,
    dto: TransferStockDto,
    actor: AuthenticatedUser,
  ): Promise<TransferStockResponseDto> {
    const { source, destination } = await this.withOptimisticRetry(async () => {
      const sourceItem = await this.getExistingItem(sourceId);

      if (sourceItem.warehouseId === dto.destinationWarehouseId) {
        throw new BadRequestError("Source and destination warehouse must be different");
      }

      const destinationItem = await this.inventoryRepository.findOrCreateBySkuAndWarehouse(
        sourceItem.sku,
        dto.destinationWarehouseId,
      );

      const sourceAvailable = getAvailableQuantity(sourceItem);
      if (dto.quantity > sourceAvailable) {
        throw new ConflictError(
          `Cannot transfer ${dto.quantity} unit(s): only ${sourceAvailable} available at the source warehouse`,
        );
      }

      const newSourceQuantity = sourceItem.quantity - dto.quantity;
      const newDestinationQuantity = destinationItem.quantity + dto.quantity;

      return this.inventoryRepository.transferStock({
        source: {
          id: sourceItem.id,
          expectedVersion: sourceItem.version,
          newQuantity: newSourceQuantity,
          newStatus: this.deriveStatus(sourceItem, newSourceQuantity, sourceItem.reservedQuantity),
        },
        destination: {
          id: destinationItem.id,
          expectedVersion: destinationItem.version,
          newQuantity: newDestinationQuantity,
          newStatus: this.deriveStatus(
            destinationItem,
            newDestinationQuantity,
            destinationItem.reservedQuantity,
          ),
        },
        quantity: dto.quantity,
        reason: dto.reason ?? null,
      });
    });

    logger.info(
      {
        sourceInventoryItemId: sourceId,
        destinationInventoryItemId: destination.id,
        quantity: dto.quantity,
        actorId: actor.id,
      },
      "Inventory stock transferred",
    );
    return inventoryMapper.toTransferResponseDto(source, destination);
  }

  private async getExistingItem(id: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findById(id);
    if (!item) {
      throw new NotFoundError("Inventory item not found");
    }
    return item;
  }

  /** Recomputes `status` from the given (already-updated) quantity
   * numbers, unless `item.status` is currently `DISCONTINUED` —
   * discontinuation is a deliberate lifecycle decision that a quantity
   * change should never silently override (see
   * `resolveStockStatus`'s doc comment). */
  private deriveStatus(
    item: InventoryItem,
    quantity: number,
    reservedQuantity: number,
  ): InventoryStatus {
    if (item.status === INVENTORY_STATUSES.DISCONTINUED) {
      return item.status;
    }
    const available = getAvailableQuantity({ quantity, reservedQuantity });
    return resolveStockStatus(available, item.lowStockThreshold);
  }

  /** Reruns `operation` from scratch (a fresh read through to the
   * version-checked write) whenever it loses an optimistic-concurrency
   * race, up to `INVENTORY_MAX_OPTIMISTIC_RETRY_ATTEMPTS` times. Only
   * catches `InventoryConcurrencyError` specifically — any other error
   * `operation` throws (e.g. a `ConflictError` for insufficient stock,
   * a business rule no retry would change) propagates immediately. */
  private async withOptimisticRetry<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 0;
    for (;;) {
      attempt += 1;
      try {
        return await operation();
      } catch (error) {
        const isRetryable = error instanceof InventoryConcurrencyError;
        if (!isRetryable || attempt >= INVENTORY_MAX_OPTIMISTIC_RETRY_ATTEMPTS) {
          throw error;
        }
        logger.warn({ attempt }, "Inventory optimistic concurrency conflict; retrying");
      }
    }
  }
}
