import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { InventoryFilterOptions } from "../interfaces";
import type {
  CreateInventoryItemInput,
  CreateInventoryMovementInput,
  InventoryItem,
  InventoryMovement,
  UpdateInventoryItemInput,
} from "../types";

/**
 * Persistence contract for the InventoryItem domain entity, plus the
 * inventory-movement ledger foundation. The service depends on this
 * interface, never on a concrete implementation directly, so swapping
 * `InventoryPrismaRepository` for a test double (or a different
 * persistence layer entirely) never touches service code.
 *
 * `recordMovement`/`findMovementsByItemId` are the movement side of this
 * contract — recording a movement and applying its effect to an item's
 * `quantity` are two different concerns, and only the former is defined
 * here. A concrete implementation is free to make both happen inside
 * one transaction; this interface doesn't presume that.
 */
export interface InventoryRepository {
  findById(id: string): Promise<InventoryItem | null>;
  findBySku(sku: string): Promise<InventoryItem | null>;
  findBySkuAndWarehouse(sku: string, warehouseId: string): Promise<InventoryItem | null>;
  findAll(
    query: ParsedQuery,
    filters?: InventoryFilterOptions,
  ): Promise<PaginatedResult<InventoryItem>>;
  create(data: CreateInventoryItemInput): Promise<InventoryItem>;
  update(id: string, data: UpdateInventoryItemInput): Promise<InventoryItem>;
  delete(id: string): Promise<void>;

  recordMovement(data: CreateInventoryMovementInput): Promise<InventoryMovement>;
  findMovementsByItemId(
    inventoryItemId: string,
    query: ParsedQuery,
  ): Promise<PaginatedResult<InventoryMovement>>;
}
