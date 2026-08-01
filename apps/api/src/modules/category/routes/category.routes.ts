import { Router } from "express";

import { authenticate, extractCurrentUser } from "../../../auth";
import { validateRequest } from "../../../common";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { CategoryController } from "../controller";
import { CategoryPrismaRepository } from "../repository";
import { CategoryService } from "../service";
import {
  categoryIdParamsSchema,
  categorySlugParamsSchema,
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
  updateCategoryVisibilitySchema,
} from "../validation";

const categoryRepository = new CategoryPrismaRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

/**
 * The full Category API surface, mounted at `/api/v1/categories` (see
 * `routes/v1/index.ts`). Read endpoints use `extractCurrentUser` (never
 * `authenticate`) so anonymous storefront browsing works — the service
 * itself scopes results down to `ACTIVE`/`PUBLIC`, non-deleted
 * categories for anyone without `category:read` (see
 * `service/category.service.ts`). Every mutating endpoint requires
 * authentication plus the matching `category:*` permission.
 *
 * `/tree` is registered before `/:id`: both are exactly one path
 * segment under `/categories`, so `/:id` would otherwise capture
 * "tree" as an id (Express matches equally-specific paths in
 * registration order, not by literal-vs-param specificity).
 */
export const categoryRouter: Router = Router();

categoryRouter.get("/", extractCurrentUser, categoryController.list);
categoryRouter.get("/tree", extractCurrentUser, categoryController.getTree);
categoryRouter.get(
  "/slug/:slug",
  extractCurrentUser,
  validateRequest({ params: categorySlugParamsSchema }),
  categoryController.getBySlug,
);

categoryRouter.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_CREATE),
  validateRequest({ body: createCategorySchema }),
  categoryController.create,
);

categoryRouter.get(
  "/:id",
  extractCurrentUser,
  validateRequest({ params: categoryIdParamsSchema }),
  categoryController.getById,
);
categoryRouter.get(
  "/:id/tree",
  extractCurrentUser,
  validateRequest({ params: categoryIdParamsSchema }),
  categoryController.getSubtree,
);
categoryRouter.get(
  "/:id/children",
  extractCurrentUser,
  validateRequest({ params: categoryIdParamsSchema }),
  categoryController.getChildren,
);
categoryRouter.patch(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_UPDATE),
  validateRequest({ params: categoryIdParamsSchema, body: updateCategorySchema }),
  categoryController.update,
);
categoryRouter.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_DELETE),
  validateRequest({ params: categoryIdParamsSchema }),
  categoryController.delete,
);

categoryRouter.patch(
  "/:id/status",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_UPDATE),
  validateRequest({ params: categoryIdParamsSchema, body: updateCategoryStatusSchema }),
  categoryController.updateStatus,
);
categoryRouter.patch(
  "/:id/visibility",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_UPDATE),
  validateRequest({ params: categoryIdParamsSchema, body: updateCategoryVisibilitySchema }),
  categoryController.updateVisibility,
);
categoryRouter.post(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.CATEGORY_DELETE),
  validateRequest({ params: categoryIdParamsSchema }),
  categoryController.restore,
);
