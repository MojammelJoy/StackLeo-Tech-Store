import type { InventoryStatus } from "../constants";

/**
 * The persisted InventoryItem domain entity. Not a Prisma-generated type
 * — no `InventoryItem` model exists in `prisma/schema.prisma` yet (out
 * of scope for this foundation). `warehouseId` is a bare foreign-key-
 * shaped field, not a dependency on a warehouse module (explicitly out
 * of scope). `sku` mirrors `modules/product`'s `Product.sku` by
 * convention only — there is no enforced relationship between the two
 * modules.
 *
 * Deliberately has no `availableQuantity` field: `quantity - reservedQuantity`
 * is a derived fact, not stored state, so it can never drift out of sync
 * with its inputs. See `mapper/inventory-calculations.ts`'s
 * `getAvailableQuantity`.
 */
export interface InventoryItem {
  id: string;
  sku: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  status: InventoryStatus;
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

export interface UpdateInventoryItemInput {
  quantity?: number;
  reservedQuantity?: number;
  lowStockThreshold?: number;
  status?: InventoryStatus;
}
