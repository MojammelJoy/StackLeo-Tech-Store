import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { CartPrismaRepository, CartService, ProductAvailabilityPrismaRepository } from "../../cart";
import {
  CouponController,
  CouponPrismaRepository,
  CouponService,
  ProductCategoryLookupPrismaRepository,
  couponIdParamsSchema,
  createCouponSchema,
  updateCouponSchema,
} from "../../coupon";
import { PERMISSIONS, requirePermission } from "../../rbac";

import type { CartSnapshotProvider } from "../../coupon";

const couponRepository = new CouponPrismaRepository();
const productCategoryLookup = new ProductCategoryLookupPrismaRepository();

/** `CouponService`'s cart-integration dependency — never actually
 * exercised by any admin-only endpoint below (`validate`/`apply`/remove
 * are shopper self-service, deliberately excluded from this admin
 * router — see this file's doc comment), but still required to
 * construct a real `CouponService` instance, mirroring
 * `modules/coupon/routes/coupon.routes.ts`'s own composition exactly. */
const cartServiceForCoupon = new CartService(
  new CartPrismaRepository(),
  new ProductAvailabilityPrismaRepository(),
);
const cartSnapshot: CartSnapshotProvider = {
  async getOwnedCartSnapshot(actor) {
    const cart = await cartServiceForCoupon.getCartForUser(actor);
    return {
      id: cart.id,
      currency: cart.summary.currency,
      total: cart.summary.total,
      productIds: [...new Set(cart.items.map((item) => item.productId))],
    };
  },
};

const couponService = new CouponService(couponRepository, cartSnapshot, productCategoryLookup);
const couponController = new CouponController(couponService);

/**
 * Mounted at `/api/v1/admin/coupons`. Reuses `modules/coupon`'s own
 * `CouponController`/`CouponService` outright for every genuinely
 * administrative operation (list/get/create/update/delete/restore, all
 * already `coupon:*`-gated in `modules/coupon`'s own router too).
 * Deliberately excludes `validate`/`apply`/`GET /code/:code`/
 * `DELETE /apply/:code` — those are shopper self-service (apply a
 * coupon to *my own* cart), not administration, and stay reachable only
 * at `/api/v1/coupons`.
 */
export const adminCouponRouter: Router = Router();

adminCouponRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.COUPON_READ),
  couponController.list,
);
adminCouponRouter.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.COUPON_CREATE),
  validateRequest({ body: createCouponSchema }),
  couponController.create,
);
adminCouponRouter.get(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.COUPON_READ),
  validateRequest({ params: couponIdParamsSchema }),
  couponController.getById,
);
adminCouponRouter.patch(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.COUPON_UPDATE),
  validateRequest({ params: couponIdParamsSchema, body: updateCouponSchema }),
  couponController.update,
);
adminCouponRouter.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.COUPON_DELETE),
  validateRequest({ params: couponIdParamsSchema }),
  couponController.delete,
);
adminCouponRouter.post(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.COUPON_DELETE),
  validateRequest({ params: couponIdParamsSchema }),
  couponController.restore,
);
