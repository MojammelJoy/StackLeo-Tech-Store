import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import {
  ProductController,
  ProductPrismaRepository,
  ProductService,
  ProductSpecificationPrismaRepository,
  ProductVariantPrismaRepository,
  createProductSchema,
  productIdParamsSchema,
  updateProductSchema,
  updateProductStatusSchema,
  updateProductVisibilitySchema,
} from "../../product";
import { PERMISSIONS, requirePermission } from "../../rbac";

const productRepository = new ProductPrismaRepository();
const productVariantRepository = new ProductVariantPrismaRepository();
const productSpecificationRepository = new ProductSpecificationPrismaRepository();
const productService = new ProductService(
  productRepository,
  productVariantRepository,
  productSpecificationRepository,
);
const productController = new ProductController(productService);

/**
 * Mounted at `/api/v1/admin/products`. Reuses `modules/product`'s own
 * `ProductController`/`ProductService` outright — a fresh instance,
 * constructed exactly like `modules/product/routes/product.routes.ts`
 * does, never the same singleton (mirrors every other module's
 * composition-root convention). The only difference from the public
 * `/products` router is authorization: every route here requires
 * `authenticate` + `product:*`, including reads — the public router
 * instead uses `extractCurrentUser` for reads so anonymous storefront
 * browsing works, with the service itself scoping unprivileged results
 * down to `ACTIVE`/`PUBLIC`. An authenticated caller with `product:read`
 * gets the exact same full (including soft-deleted) visibility either
 * way, since that scoping already keys off the permission, not the
 * route — this router just removes the anonymous path and requires the
 * permission unconditionally.
 */
export const adminProductRouter: Router = Router();

adminProductRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_READ),
  productController.list,
);
adminProductRouter.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  validateRequest({ body: createProductSchema }),
  productController.create,
);
adminProductRouter.get(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_READ),
  validateRequest({ params: productIdParamsSchema }),
  productController.getById,
);
adminProductRouter.patch(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  validateRequest({ params: productIdParamsSchema, body: updateProductSchema }),
  productController.update,
);
adminProductRouter.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  validateRequest({ params: productIdParamsSchema }),
  productController.delete,
);
adminProductRouter.patch(
  "/:id/status",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  validateRequest({ params: productIdParamsSchema, body: updateProductStatusSchema }),
  productController.updateStatus,
);
adminProductRouter.patch(
  "/:id/visibility",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  validateRequest({ params: productIdParamsSchema, body: updateProductVisibilitySchema }),
  productController.updateVisibility,
);
adminProductRouter.post(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  validateRequest({ params: productIdParamsSchema }),
  productController.restore,
);
