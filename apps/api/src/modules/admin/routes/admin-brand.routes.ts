import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import {
  BrandController,
  BrandPrismaRepository,
  BrandService,
  brandIdParamsSchema,
  createBrandSchema,
  updateBrandLogoSchema,
  updateBrandSchema,
  updateBrandStatusSchema,
  updateBrandVisibilitySchema,
} from "../../brand";
import { PERMISSIONS, requirePermission } from "../../rbac";

const brandRepository = new BrandPrismaRepository();
const brandService = new BrandService(brandRepository);
const brandController = new BrandController(brandService);

/**
 * Mounted at `/api/v1/admin/brands`. Reuses `modules/brand`'s own
 * `BrandController`/`BrandService` outright — see
 * `routes/admin-product.routes.ts`'s doc comment for why (identical
 * reasoning, `brand:*` instead of `product:*`).
 */
export const adminBrandRouter: Router = Router();

adminBrandRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_READ),
  brandController.list,
);
adminBrandRouter.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_CREATE),
  validateRequest({ body: createBrandSchema }),
  brandController.create,
);
adminBrandRouter.get(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_READ),
  validateRequest({ params: brandIdParamsSchema }),
  brandController.getById,
);
adminBrandRouter.patch(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_UPDATE),
  validateRequest({ params: brandIdParamsSchema, body: updateBrandSchema }),
  brandController.update,
);
adminBrandRouter.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_DELETE),
  validateRequest({ params: brandIdParamsSchema }),
  brandController.delete,
);
adminBrandRouter.patch(
  "/:id/status",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_UPDATE),
  validateRequest({ params: brandIdParamsSchema, body: updateBrandStatusSchema }),
  brandController.updateStatus,
);
adminBrandRouter.patch(
  "/:id/visibility",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_UPDATE),
  validateRequest({ params: brandIdParamsSchema, body: updateBrandVisibilitySchema }),
  brandController.updateVisibility,
);
adminBrandRouter.patch(
  "/:id/logo",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_UPDATE),
  validateRequest({ params: brandIdParamsSchema, body: updateBrandLogoSchema }),
  brandController.updateLogo,
);
adminBrandRouter.post(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_DELETE),
  validateRequest({ params: brandIdParamsSchema }),
  brandController.restore,
);
