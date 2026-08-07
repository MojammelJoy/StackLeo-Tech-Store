import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { ReviewController } from "../controller";
import {
  ProductExistencePrismaRepository,
  ReviewPrismaRepository,
  VerifiedPurchaseLookupPrismaRepository,
} from "../repository";
import { ReviewService } from "../service";
import {
  createReviewSchema,
  moderateReviewSchema,
  productIdParamsSchema,
  reviewIdParamsSchema,
  updateReviewSchema,
  voteHelpfulSchema,
} from "../validation";

const reviewRepository = new ReviewPrismaRepository();
const productExistence = new ProductExistencePrismaRepository();
const verifiedPurchaseLookup = new VerifiedPurchaseLookupPrismaRepository();

const reviewService = new ReviewService(reviewRepository, productExistence, verifiedPurchaseLookup);
const reviewController = new ReviewController(reviewService);

/**
 * The full Review API surface, mounted at `/api/v1/reviews` (see
 * `routes/v1/index.ts`). Every endpoint requires `authenticate` — this
 * module has no guest/public path at all, per this API's "authenticated
 * users only" requirement (mirroring `modules/payment`). Only
 * `PATCH /:id/moderation` additionally requires `review:moderate` —
 * every other endpoint self-scopes via ownership or the
 * approved-or-own visibility rule `ReviewService` applies.
 *
 * Route order matters: `/me`, `/product/:productId`, and
 * `/product/:productId/summary` are registered before the generic
 * `/:id` so Express never mistakes one of those literal segments for an
 * `:id`.
 */
export const reviewRouter: Router = Router();

reviewRouter.post(
  "/",
  authenticate,
  validateRequest({ body: createReviewSchema }),
  reviewController.create,
);

reviewRouter.get("/me", authenticate, reviewController.listMine);

reviewRouter.get(
  "/product/:productId",
  authenticate,
  validateRequest({ params: productIdParamsSchema }),
  reviewController.listForProduct,
);
reviewRouter.get(
  "/product/:productId/summary",
  authenticate,
  validateRequest({ params: productIdParamsSchema }),
  reviewController.getRatingSummary,
);

reviewRouter.get(
  "/:id",
  authenticate,
  validateRequest({ params: reviewIdParamsSchema }),
  reviewController.getById,
);
reviewRouter.patch(
  "/:id",
  authenticate,
  validateRequest({ params: reviewIdParamsSchema, body: updateReviewSchema }),
  reviewController.update,
);
reviewRouter.delete(
  "/:id",
  authenticate,
  validateRequest({ params: reviewIdParamsSchema }),
  reviewController.delete,
);
reviewRouter.post(
  "/:id/restore",
  authenticate,
  validateRequest({ params: reviewIdParamsSchema }),
  reviewController.restore,
);
reviewRouter.patch(
  "/:id/moderation",
  authenticate,
  requirePermission(PERMISSIONS.REVIEW_MODERATE),
  validateRequest({ params: reviewIdParamsSchema, body: moderateReviewSchema }),
  reviewController.moderate,
);
reviewRouter.post(
  "/:id/vote",
  authenticate,
  validateRequest({ params: reviewIdParamsSchema, body: voteHelpfulSchema }),
  reviewController.vote,
);
