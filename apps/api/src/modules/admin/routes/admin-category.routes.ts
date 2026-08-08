import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import {
  CategoryController,
  CategoryPrismaRepository,
  CategoryService,
  categoryIdParamsSchema,
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
  updateCategoryVisibilitySchema,
} from "../../category";
import { PERMISSIONS, requirePermission } from "../../rbac";

const categoryRepository = new CategoryPrismaRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

/**
 * Mounted at `/api/v1/admin/categories`. Reuses `modules/category`'s own
 * `CategoryController`/`CategoryService` outright — see
 * `routes/admin-product.routes.ts`'s doc comment for why (identical
 * reasoning, `category:*` instead of `product:*`).
 */
export const adminCategoryRouter: Router = Router();

adminCategoryRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_READ),
  categoryController.list,
);
adminCategoryRouter.get(
  "/tree",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_READ),
  categoryController.getTree,
);
adminCategoryRouter.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_CREATE),
  validateRequest({ body: createCategorySchema }),
  categoryController.create,
);
adminCategoryRouter.get(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_READ),
  validateRequest({ params: categoryIdParamsSchema }),
  categoryController.getById,
);
adminCategoryRouter.get(
  "/:id/tree",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_READ),
  validateRequest({ params: categoryIdParamsSchema }),
  categoryController.getSubtree,
);
adminCategoryRouter.get(
  "/:id/children",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_READ),
  validateRequest({ params: categoryIdParamsSchema }),
  categoryController.getChildren,
);
adminCategoryRouter.patch(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_UPDATE),
  validateRequest({ params: categoryIdParamsSchema, body: updateCategorySchema }),
  categoryController.update,
);
adminCategoryRouter.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_DELETE),
  validateRequest({ params: categoryIdParamsSchema }),
  categoryController.delete,
);
adminCategoryRouter.patch(
  "/:id/status",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_UPDATE),
  validateRequest({ params: categoryIdParamsSchema, body: updateCategoryStatusSchema }),
  categoryController.updateStatus,
);
adminCategoryRouter.patch(
  "/:id/visibility",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_UPDATE),
  validateRequest({ params: categoryIdParamsSchema, body: updateCategoryVisibilitySchema }),
  categoryController.updateVisibility,
);
adminCategoryRouter.post(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_DELETE),
  validateRequest({ params: categoryIdParamsSchema }),
  categoryController.restore,
);
