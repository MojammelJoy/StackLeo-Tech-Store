import { Router } from "express";

import { authenticate, extractCurrentUser } from "../../../auth";
import { validateRequest } from "../../../common";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { BrandController } from "../controller";
import { BrandPrismaRepository } from "../repository";
import { BrandService } from "../service";
import {
  brandIdParamsSchema,
  brandSlugParamsSchema,
  createBrandSchema,
  updateBrandLogoSchema,
  updateBrandSchema,
  updateBrandStatusSchema,
  updateBrandVisibilitySchema,
} from "../validation";

const brandRepository = new BrandPrismaRepository();
const brandService = new BrandService(brandRepository);
const brandController = new BrandController(brandService);

/**
 * The full Brand API surface, mounted at `/api/v1/brands` (see
 * `routes/v1/index.ts`). Read endpoints use `extractCurrentUser` (never
 * `authenticate`) so anonymous storefront browsing works — the service
 * itself scopes results down to `ACTIVE`/`PUBLIC`, non-deleted brands
 * for anyone without `brand:read` (see `service/brand.service.ts`).
 * Every mutating endpoint requires authentication plus the matching
 * `brand:*` permission.
 */
export const brandRouter: Router = Router();

brandRouter.get("/", extractCurrentUser, brandController.list);
brandRouter.get(
  "/slug/:slug",
  extractCurrentUser,
  validateRequest({ params: brandSlugParamsSchema }),
  brandController.getBySlug,
);

brandRouter.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_CREATE),
  validateRequest({ body: createBrandSchema }),
  brandController.create,
);

brandRouter.get(
  "/:id",
  extractCurrentUser,
  validateRequest({ params: brandIdParamsSchema }),
  brandController.getById,
);
brandRouter.patch(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_UPDATE),
  validateRequest({ params: brandIdParamsSchema, body: updateBrandSchema }),
  brandController.update,
);
brandRouter.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_DELETE),
  validateRequest({ params: brandIdParamsSchema }),
  brandController.delete,
);

brandRouter.patch(
  "/:id/status",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_UPDATE),
  validateRequest({ params: brandIdParamsSchema, body: updateBrandStatusSchema }),
  brandController.updateStatus,
);
brandRouter.patch(
  "/:id/visibility",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_UPDATE),
  validateRequest({ params: brandIdParamsSchema, body: updateBrandVisibilitySchema }),
  brandController.updateVisibility,
);
brandRouter.patch(
  "/:id/logo",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_UPDATE),
  validateRequest({ params: brandIdParamsSchema, body: updateBrandLogoSchema }),
  brandController.updateLogo,
);
brandRouter.post(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.BRAND_DELETE),
  validateRequest({ params: brandIdParamsSchema }),
  brandController.restore,
);
