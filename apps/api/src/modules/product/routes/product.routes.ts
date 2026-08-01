import { Router } from "express";

import { authenticate, extractCurrentUser } from "../../../auth";
import { validateRequest } from "../../../common";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { ProductController } from "../controller";
import {
  ProductPrismaRepository,
  ProductSpecificationPrismaRepository,
  ProductVariantPrismaRepository,
} from "../repository";
import { ProductService } from "../service";
import {
  createProductSchema,
  createProductVariantSchema,
  productIdParamsSchema,
  productSlugParamsSchema,
  productVariantParamsSchema,
  replaceProductSpecificationsSchema,
  updateProductSchema,
  updateProductStatusSchema,
  updateProductVariantSchema,
  updateProductVisibilitySchema,
} from "../validation";

const productRepository = new ProductPrismaRepository();
const variantRepository = new ProductVariantPrismaRepository();
const specificationRepository = new ProductSpecificationPrismaRepository();
const productService = new ProductService(
  productRepository,
  variantRepository,
  specificationRepository,
);
const productController = new ProductController(productService);

/**
 * The full Product API surface, mounted at `/api/v1/products` (see
 * `routes/v1/index.ts`). Read endpoints use `extractCurrentUser` (never
 * `authenticate`) so anonymous storefront browsing works — the service
 * itself scopes results down to `ACTIVE`/`PUBLIC`, non-deleted products
 * for anyone without `product:read` (see `service/product.service.ts`).
 * Every mutating endpoint requires authentication plus the matching
 * `product:*` permission.
 */
export const productRouter: Router = Router();

productRouter.get("/", extractCurrentUser, productController.list);
productRouter.get(
  "/slug/:slug",
  extractCurrentUser,
  validateRequest({ params: productSlugParamsSchema }),
  productController.getBySlug,
);

productRouter.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_CREATE),
  validateRequest({ body: createProductSchema }),
  productController.create,
);

productRouter.get(
  "/:id",
  extractCurrentUser,
  validateRequest({ params: productIdParamsSchema }),
  productController.getById,
);
productRouter.patch(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  validateRequest({ params: productIdParamsSchema, body: updateProductSchema }),
  productController.update,
);
productRouter.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  validateRequest({ params: productIdParamsSchema }),
  productController.delete,
);

productRouter.patch(
  "/:id/status",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  validateRequest({ params: productIdParamsSchema, body: updateProductStatusSchema }),
  productController.updateStatus,
);
productRouter.patch(
  "/:id/visibility",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  validateRequest({ params: productIdParamsSchema, body: updateProductVisibilitySchema }),
  productController.updateVisibility,
);
productRouter.post(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_DELETE),
  validateRequest({ params: productIdParamsSchema }),
  productController.restore,
);

productRouter.post(
  "/:id/variants",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  validateRequest({ params: productIdParamsSchema, body: createProductVariantSchema }),
  productController.addVariant,
);
productRouter.patch(
  "/:id/variants/:variantId",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  validateRequest({ params: productVariantParamsSchema, body: updateProductVariantSchema }),
  productController.updateVariant,
);
productRouter.delete(
  "/:id/variants/:variantId",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  validateRequest({ params: productVariantParamsSchema }),
  productController.removeVariant,
);

productRouter.put(
  "/:id/specifications",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCT_UPDATE),
  validateRequest({ params: productIdParamsSchema, body: replaceProductSpecificationsSchema }),
  productController.replaceSpecifications,
);
