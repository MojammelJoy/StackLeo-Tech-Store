/**
 * Reusable inventory infrastructure: domain types (stock item +
 * movement), DTOs + Zod validation schemas (built from reusable field-
 * level schemas in `schemas/`), the repository contract (plus its
 * currently-skeletal Prisma implementation), a skeleton service, and
 * the mapper/derived-quantity calculations between the domain entity
 * and its response DTO. No controllers, routes, CRUD implementation, or
 * business logic (warehouse/order/payment concerns, or actually applying
 * a movement's effect to an item's quantity) live here.
 */
export {
  INVENTORY_FILTERABLE_FIELDS,
  INVENTORY_LOW_STOCK_THRESHOLD_DEFAULT,
  INVENTORY_MOVEMENT_REASON_MAX_LENGTH,
  INVENTORY_MOVEMENT_TYPES,
  INVENTORY_QUANTITY_MIN,
  INVENTORY_SKU_MAX_LENGTH,
  INVENTORY_SORTABLE_FIELDS,
  INVENTORY_STATUSES,
} from "./constants";
export type { InventoryMovementType, InventoryStatus } from "./constants";

export type {
  CreateInventoryItemInput,
  CreateInventoryMovementInput,
  InventoryItem,
  InventoryMovement,
  UpdateInventoryItemInput,
} from "./types";

export { inventorySkuSchema, nonNegativeQuantitySchema, positiveQuantitySchema } from "./schemas";

export {
  createInventoryItemSchema,
  createInventoryMovementSchema,
  updateInventoryItemSchema,
} from "./validation";
export type {
  CreateInventoryItemDto,
  CreateInventoryMovementDto,
  InventoryItemResponseDto,
  InventoryMovementResponseDto,
  UpdateInventoryItemDto,
} from "./dto";

export type { InventoryFilterOptions, InventoryMapper } from "./interfaces";

export { getAvailableQuantity, inventoryMapper, resolveStockStatus } from "./mapper";

export { InventoryPrismaRepository } from "./repository";
export type { InventoryRepository } from "./repository";

export { InventoryService } from "./service";
