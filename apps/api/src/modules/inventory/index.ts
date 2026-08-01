/**
 * The Inventory API: create/update inventory records, stock mutations
 * (increase/decrease/reserve/release/adjust/transfer) with an
 * append-only movement audit trail, movement history, and listing
 * (pagination, filtering, sorting, search) — a real, working feature,
 * not reusable-infrastructure-only scaffolding. Built on `common/`,
 * `database/`, `logger/`, `errors/`, and `modules/rbac`
 * (permission-gating every route, reads included — see
 * `PERMISSIONS.INVENTORY_READ`'s doc comment). Deliberately excludes
 * product/category/brand CRUD and every other domain's business logic
 * (cart, wishlist, reviews, orders, payment) — those stay out of this
 * module.
 *
 * Deliberately has no delete/restore: unlike the catalog modules,
 * "delete an inventory record" isn't a requested feature for this API,
 * and hard-deleting a record with an attached movement ledger is a
 * meaningfully different, unrequested design problem (what happens to
 * its audit trail?) — `InventoryRepository.delete`/
 * `InventoryService.delete` are left as this foundation's original
 * skeleton stubs rather than guessed at.
 */
export {
  INVENTORY_FILTERABLE_FIELDS,
  INVENTORY_LOW_STOCK_THRESHOLD_DEFAULT,
  INVENTORY_MAX_OPTIMISTIC_RETRY_ATTEMPTS,
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
  InventoryItem,
  InventoryMovement,
  StockChangeInput,
  StockTransferSide,
  TransferStockParams,
  UpdateInventoryItemInput,
} from "./types";

export { InventoryConcurrencyError } from "./errors";

export {
  inventorySkuSchema,
  movementRequestSchema,
  nonNegativeQuantitySchema,
  positiveQuantitySchema,
} from "./schemas";

export {
  adjustStockSchema,
  createInventoryItemSchema,
  createInventoryMovementSchema,
  decreaseStockSchema,
  increaseStockSchema,
  inventoryIdParamsSchema,
  inventorySkuParamsSchema,
  releaseStockSchema,
  reserveStockSchema,
  transferStockSchema,
  updateInventoryItemSchema,
} from "./validation";
export type {
  AdjustStockDto,
  CreateInventoryItemDto,
  CreateInventoryMovementDto,
  DecreaseStockDto,
  IncreaseStockDto,
  InventoryItemResponseDto,
  InventoryMovementResponseDto,
  ReleaseStockDto,
  ReserveStockDto,
  TransferStockDto,
  TransferStockResponseDto,
  UpdateInventoryItemDto,
} from "./dto";

export type { InventoryFilterOptions, InventoryMapper } from "./interfaces";

export { getAvailableQuantity, inventoryMapper, resolveStockStatus } from "./mapper";

export { InventoryPrismaRepository } from "./repository";
export type { InventoryRepository } from "./repository";

export { InventoryService } from "./service";

export { InventoryController } from "./controller";

export { inventoryRouter } from "./routes";
