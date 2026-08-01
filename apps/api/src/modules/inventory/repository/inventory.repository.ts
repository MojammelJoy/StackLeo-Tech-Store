import type { PaginatedResult, ParsedQuery } from "../../../common";
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

/**
 * Persistence contract for the InventoryItem domain entity, plus the
 * inventory-movement ledger. The service depends on this interface,
 * never on a concrete implementation directly, so swapping
 * `InventoryPrismaRepository` for a test double (or a different
 * persistence layer entirely) never touches service code.
 *
 * `applyStockChange`/`transferStock` are this module's core
 * transactional primitives: every quantity-affecting service method
 * (`increaseStock`/`decreaseStock`/`reserveStock`/`releaseStock`/
 * `adjustStock`/`transferStock`) routes through one of them, so a
 * quantity change and its audit-trail movement row are always written
 * atomically, and never without an optimistic-concurrency check against
 * the caller's last-read `version`. Both take already-computed new
 * values rather than deltas — figuring out what the new values *should*
 * be (negative-stock prevention, status re-derivation) is
 * `service/inventory.service.ts`'s job, not this layer's.
 */
export interface InventoryRepository {
  findById(id: string): Promise<InventoryItem | null>;
  /** Returns an arbitrary match when multiple warehouses stock the
   * same SKU — prefer `findBySkuAndWarehouse` whenever the warehouse is
   * known. */
  findBySku(sku: string): Promise<InventoryItem | null>;
  findBySkuAndWarehouse(sku: string, warehouseId: string): Promise<InventoryItem | null>;
  findAll(
    query: ParsedQuery,
    filters?: InventoryFilterOptions,
  ): Promise<PaginatedResult<InventoryItem>>;

  /** Creates a new item, plus — when `data.quantity` is greater than
   * zero — an initial `STOCK_IN` movement recording the starting stock,
   * both in one transaction, so a freshly created item's audit trail
   * always accounts for every unit it starts with. */
  create(data: CreateInventoryItemInput): Promise<InventoryItem>;
  update(id: string, data: UpdateInventoryItemInput): Promise<InventoryItem>;
  delete(id: string): Promise<void>;

  /** Idempotently ensures an item exists for `(sku, warehouseId)`,
   * creating one with zero stock if it doesn't yet — used by
   * `service/inventory.service.ts`'s `transferStock` to auto-vivify a
   * destination warehouse record on first transfer there. */
  findOrCreateBySkuAndWarehouse(sku: string, warehouseId: string): Promise<InventoryItem>;

  applyStockChange(
    id: string,
    expectedVersion: number,
    changes: StockChangeInput,
    movement: Omit<CreateInventoryMovementInput, "inventoryItemId">,
  ): Promise<InventoryItem>;

  /** Moves stock between two items atomically: both version-checked
   * updates plus both `TRANSFER_OUT`/`TRANSFER_IN` movement rows, in
   * one transaction. */
  transferStock(
    params: TransferStockParams,
  ): Promise<{ source: InventoryItem; destination: InventoryItem }>;

  findMovementsByItemId(
    inventoryItemId: string,
    query: ParsedQuery,
  ): Promise<PaginatedResult<InventoryMovement>>;
}
