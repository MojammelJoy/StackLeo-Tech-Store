import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { InventoryController } from "../controller";
import { InventoryPrismaRepository } from "../repository";
import { InventoryService } from "../service";
import {
  adjustStockSchema,
  createInventoryItemSchema,
  decreaseStockSchema,
  increaseStockSchema,
  inventoryIdParamsSchema,
  inventorySkuParamsSchema,
  releaseStockSchema,
  reserveStockSchema,
  transferStockSchema,
  updateInventoryItemSchema,
} from "../validation";

const inventoryRepository = new InventoryPrismaRepository();
const inventoryService = new InventoryService(inventoryRepository);
const inventoryController = new InventoryController(inventoryService);

/**
 * The full Inventory API surface, mounted at `/api/v1/inventory` (see
 * `routes/v1/index.ts`). Unlike the catalog modules' routers, *every*
 * route here requires `authenticate` — there is no anonymous read path
 * (see `PERMISSIONS.INVENTORY_READ`'s doc comment). Stock-mutating
 * routes require `inventory:update`; `adjust` requires the separate,
 * more sensitive `inventory:adjust` (see
 * `service/inventory.service.ts`'s `adjustStock` doc comment).
 */
export const inventoryRouter: Router = Router();

inventoryRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.INVENTORY_READ),
  inventoryController.list,
);
inventoryRouter.get(
  "/sku/:sku",
  authenticate,
  requirePermission(PERMISSIONS.INVENTORY_READ),
  validateRequest({ params: inventorySkuParamsSchema }),
  inventoryController.getBySku,
);

inventoryRouter.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.INVENTORY_CREATE),
  validateRequest({ body: createInventoryItemSchema }),
  inventoryController.create,
);

inventoryRouter.get(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.INVENTORY_READ),
  validateRequest({ params: inventoryIdParamsSchema }),
  inventoryController.getById,
);
inventoryRouter.patch(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.INVENTORY_UPDATE),
  validateRequest({ params: inventoryIdParamsSchema, body: updateInventoryItemSchema }),
  inventoryController.update,
);

inventoryRouter.get(
  "/:id/movements",
  authenticate,
  requirePermission(PERMISSIONS.INVENTORY_READ),
  validateRequest({ params: inventoryIdParamsSchema }),
  inventoryController.getMovementHistory,
);

inventoryRouter.post(
  "/:id/increase",
  authenticate,
  requirePermission(PERMISSIONS.INVENTORY_UPDATE),
  validateRequest({ params: inventoryIdParamsSchema, body: increaseStockSchema }),
  inventoryController.increaseStock,
);
inventoryRouter.post(
  "/:id/decrease",
  authenticate,
  requirePermission(PERMISSIONS.INVENTORY_UPDATE),
  validateRequest({ params: inventoryIdParamsSchema, body: decreaseStockSchema }),
  inventoryController.decreaseStock,
);
inventoryRouter.post(
  "/:id/reserve",
  authenticate,
  requirePermission(PERMISSIONS.INVENTORY_UPDATE),
  validateRequest({ params: inventoryIdParamsSchema, body: reserveStockSchema }),
  inventoryController.reserveStock,
);
inventoryRouter.post(
  "/:id/release",
  authenticate,
  requirePermission(PERMISSIONS.INVENTORY_UPDATE),
  validateRequest({ params: inventoryIdParamsSchema, body: releaseStockSchema }),
  inventoryController.releaseStock,
);
inventoryRouter.post(
  "/:id/adjust",
  authenticate,
  requirePermission(PERMISSIONS.INVENTORY_ADJUST),
  validateRequest({ params: inventoryIdParamsSchema, body: adjustStockSchema }),
  inventoryController.adjustStock,
);
inventoryRouter.post(
  "/:id/transfer",
  authenticate,
  requirePermission(PERMISSIONS.INVENTORY_UPDATE),
  validateRequest({ params: inventoryIdParamsSchema, body: transferStockSchema }),
  inventoryController.transferStock,
);
