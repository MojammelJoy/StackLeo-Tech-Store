import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { PERMISSIONS, requirePermission } from "../../rbac";
import {
  ProductExistencePrismaRepository,
  ReviewPrismaRepository,
  ReviewService,
  VerifiedPurchaseLookupPrismaRepository,
  moderateReviewSchema,
  reviewIdParamsSchema,
} from "../../review";
import { AdminReviewController } from "../controller";
import { AdminReviewPrismaRepository } from "../repository";
import { AdminReviewService } from "../service";

const adminReviewRepository = new AdminReviewPrismaRepository();
const reviewRepository = new ReviewPrismaRepository();
const productExistence = new ProductExistencePrismaRepository();
const verifiedPurchaseLookup = new VerifiedPurchaseLookupPrismaRepository();
const reviewService = new ReviewService(reviewRepository, productExistence, verifiedPurchaseLookup);

const adminReviewService = new AdminReviewService(adminReviewRepository, reviewService);
const adminReviewController = new AdminReviewController(adminReviewService);

/**
 * Mounted at `/api/v1/admin/reviews`. Every route requires
 * `review:moderate` — the same permission `modules/review`'s own router
 * uses for its one staff-only endpoint (`PATCH /:id/moderation`), here
 * applied to the whole admin surface (listing/lookup/delete/restore are
 * ordinarily self-service in `modules/review`, but every operation
 * reachable through *this* namespace is administrative by definition).
 */
export const adminReviewRouter: Router = Router();

adminReviewRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.REVIEW_MODERATE),
  adminReviewController.list,
);
adminReviewRouter.get(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.REVIEW_MODERATE),
  validateRequest({ params: reviewIdParamsSchema }),
  adminReviewController.getById,
);
adminReviewRouter.patch(
  "/:id/moderation",
  authenticate,
  requirePermission(PERMISSIONS.REVIEW_MODERATE),
  validateRequest({ params: reviewIdParamsSchema, body: moderateReviewSchema }),
  adminReviewController.moderate,
);
adminReviewRouter.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.REVIEW_MODERATE),
  validateRequest({ params: reviewIdParamsSchema }),
  adminReviewController.delete,
);
adminReviewRouter.post(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.REVIEW_MODERATE),
  validateRequest({ params: reviewIdParamsSchema }),
  adminReviewController.restore,
);
