import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import { INVENTORY_FILTERABLE_FIELDS, INVENTORY_SORTABLE_FIELDS } from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { ParsedQuery } from "../../../common";
import type { InventoryStatus } from "../constants";
import type {
  AdjustStockDto,
  CreateInventoryItemDto,
  DecreaseStockDto,
  IncreaseStockDto,
  ReleaseStockDto,
  ReserveStockDto,
  TransferStockDto,
  UpdateInventoryItemDto,
} from "../dto";
import type { InventoryFilterOptions } from "../interfaces";
import type { InventoryService } from "../service";
import type { Request } from "express";

function requireAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  return req.user;
}

function requireParam(req: Request, key: string): string {
  const value = req.params[key];
  if (!value) {
    throw new BadRequestError(`"${key}" parameter is required`);
  }
  return value;
}

function optionalQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Combines `common/`'s generic `parsed.filters` (warehouseId/status/
 * sku) into one typed `InventoryFilterOptions` — mirrors
 * `modules/product`/`modules/category`/`modules/brand`'s
 * `extractFilterOptions`. */
function extractFilterOptions(parsed: ParsedQuery): InventoryFilterOptions {
  const filters: InventoryFilterOptions = {};

  const warehouseId = parsed.filters.warehouseId;
  if (warehouseId) {
    filters.warehouseId = String(warehouseId.value);
  }

  const status = parsed.filters.status;
  if (status) {
    filters.status = String(status.value) as InventoryStatus;
  }

  const sku = parsed.filters.sku;
  if (sku) {
    filters.sku = String(sku.value);
  }

  return filters;
}

/**
 * Express handlers for every Inventory API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/inventory.routes.ts` can reference `inventoryController.x`
 * directly), and does only three things: read the request, call one
 * `InventoryService` method, and send the response — no business logic
 * lives here. Unlike the catalog controllers, every route here requires
 * `authenticate` (never `extractCurrentUser`) — see
 * `routes/inventory.routes.ts`.
 */
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: INVENTORY_SORTABLE_FIELDS,
      filterableFields: INVENTORY_FILTERABLE_FIELDS,
    });
    const filters = extractFilterOptions(parsed);
    const result = await this.inventoryService.list(parsed, filters);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const item = await this.inventoryService.getById(id);
    sendSuccess(res, { item });
  });

  getBySku = asyncHandler(async (req, res) => {
    const sku = requireParam(req, "sku");
    const warehouseId = optionalQueryParam(req, "warehouseId");
    const item = await this.inventoryService.getBySku(sku, warehouseId);
    sendSuccess(res, { item });
  });

  getMovementHistory = asyncHandler(async (req, res) => {
    const id = requireParam(req, "id");
    const parsed = parseQuery(req.query, {});
    const result = await this.inventoryService.getMovementHistory(id, parsed);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  create = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as CreateInventoryItemDto;
    const item = await this.inventoryService.create(dto, actor);
    sendSuccess(res, { item }, { statusCode: HTTP_STATUS.CREATED });
  });

  update = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as UpdateInventoryItemDto;
    const item = await this.inventoryService.update(id, dto, actor);
    sendSuccess(res, { item });
  });

  increaseStock = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as IncreaseStockDto;
    const item = await this.inventoryService.increaseStock(id, dto, actor);
    sendSuccess(res, { item });
  });

  decreaseStock = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as DecreaseStockDto;
    const item = await this.inventoryService.decreaseStock(id, dto, actor);
    sendSuccess(res, { item });
  });

  reserveStock = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as ReserveStockDto;
    const item = await this.inventoryService.reserveStock(id, dto, actor);
    sendSuccess(res, { item });
  });

  releaseStock = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as ReleaseStockDto;
    const item = await this.inventoryService.releaseStock(id, dto, actor);
    sendSuccess(res, { item });
  });

  adjustStock = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as AdjustStockDto;
    const item = await this.inventoryService.adjustStock(id, dto, actor);
    sendSuccess(res, { item });
  });

  transferStock = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const id = requireParam(req, "id");
    const dto = req.body as TransferStockDto;
    const result = await this.inventoryService.transferStock(id, dto, actor);
    sendSuccess(res, result);
  });
}
