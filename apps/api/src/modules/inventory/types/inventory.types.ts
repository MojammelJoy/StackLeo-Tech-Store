import type { InventoryStatus } from "../constants";

/**
 * The persisted InventoryItem domain entity — matches the
 * `InventoryItem` model in `prisma/schema.prisma`. `warehouseId` is a
 * bare foreign-key-shaped field, not a dependency on a warehouse
 * module (explicitly out of scope). `sku` mirrors `modules/product`'s
 * `Product.sku` by convention only — there is no enforced relationship
 * between the two modules.
 *
 * Deliberately has no `availableQuantity` field: `quantity - reservedQuantity`
 * is a derived fact, not stored state, so it can never drift out of sync
 * with its inputs. See `mapper/inventory-calculations.ts`'s
 * `getAvailableQuantity`.
 *
 * `version` is this item's optimistic-concurrency token — see the
 * `InventoryItem` model's doc comment in `prisma/schema.prisma` for how
 * it's used.
 */
export interface InventoryItem {
  id: string;
  sku: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  status: InventoryStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Deliberately excludes `sku`/`warehouseId`: both are identity fields —
 * relocating an item to a different warehouse or SKU is a distinct
 * operation (effectively a different item) from adjusting its stock
 * levels, mirroring why `UpdateProductInput` excludes `sku`.
 */
export interface CreateInventoryItemInput {
  sku: string;
  warehouseId: string;
  quantity?: number;
  reservedQuantity?: number;
  lowStockThreshold?: number;
  status?: InventoryStatus;
}

/**
 * Deliberately excludes `quantity`/`reservedQuantity` in addition to
 * `sku`/`warehouseId`: every quantity change must go through a
 * movement-tracked, optimistic-concurrency-checked operation
 * (`InventoryService.increaseStock`/`decreaseStock`/`reserveStock`/
 * `releaseStock`/`adjustStock`/`transferStock`) so it's always recorded
 * in the audit-trail ledger — a general "update" that could silently
 * change quantity with no movement row and no version check would be
 * exactly the kind of untracked stock drift this module exists to
 * prevent. This general update is left with only the two fields that
 * are genuinely just attributes, not stock events.
 */
export interface UpdateInventoryItemInput {
  lowStockThreshold?: number;
  status?: InventoryStatus;
}
