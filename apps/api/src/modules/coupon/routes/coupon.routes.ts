import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { CartPrismaRepository, CartService, ProductAvailabilityPrismaRepository } from "../../cart";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { CouponController } from "../controller";
import { CouponPrismaRepository, ProductCategoryLookupPrismaRepository } from "../repository";
import { CouponService } from "../service";
import {
  applyCouponSchema,
  couponCodeParamsSchema,
  couponIdParamsSchema,
  createCouponSchema,
  updateCouponSchema,
} from "../validation";

import type { CartSnapshotProvider } from "../interfaces";

const couponRepository = new CouponPrismaRepository();
const productCategoryLookup = new ProductCategoryLookupPrismaRepository();

/**
 * `CouponService`'s only integration point with `modules/cart` — a real
 * `CartService` instance, constructed here (the composition root)
 * exactly like every other cross-module wiring in this app, adapted
 * down to the narrow `CartSnapshotProvider` interface — see that
 * interface's doc comment for why. `total`/`currency` come from the
 * cart's own live-priced `summary`, never a client-supplied amount.
 */
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
 * The full Coupon API surface, mounted at `/api/v1/coupons` (see
 * `routes/v1/index.ts`). Admin CRUD/listing/restore is gated by
 * `coupon:*` permissions (coupons are admin-managed, never user-owned —
 * see `PERMISSIONS.COUPON_READ`'s doc comment). Lookup-by-code and every
 * cart-integration endpoint (`validate`/`apply`/remove) need only
 * `authenticate` — "authenticated users only for coupon application",
 * enforced by `CartSnapshotProvider` always resolving *the caller's
 * own* cart, never one supplied by the request.
 *
 * Route order matters: `/validate`, `/apply`, `/apply/:code`, and
 * `/code/:code` are registered before the generic `/:id` so Express
 * never mistakes one of those literal segments for an `:id`.
 */
export const couponRouter: Router = Router();

couponRouter.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.COUPON_CREATE),
  validateRequest({ body: createCouponSchema }),
  couponController.create,
);
couponRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.COUPON_READ),
  couponController.list,
);

couponRouter.post(
  "/validate",
  authenticate,
  validateRequest({ body: applyCouponSchema }),
  couponController.validate,
);
couponRouter.post(
  "/apply",
  authenticate,
  validateRequest({ body: applyCouponSchema }),
  couponController.apply,
);
couponRouter.delete(
  "/apply/:code",
  authenticate,
  validateRequest({ params: couponCodeParamsSchema }),
  couponController.remove,
);
couponRouter.get(
  "/code/:code",
  authenticate,
  validateRequest({ params: couponCodeParamsSchema }),
  couponController.getByCode,
);

couponRouter.get(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.COUPON_READ),
  validateRequest({ params: couponIdParamsSchema }),
  couponController.getById,
);
couponRouter.patch(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.COUPON_UPDATE),
  validateRequest({ params: couponIdParamsSchema, body: updateCouponSchema }),
  couponController.update,
);
couponRouter.delete(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.COUPON_DELETE),
  validateRequest({ params: couponIdParamsSchema }),
  couponController.delete,
);
couponRouter.post(
  "/:id/restore",
  authenticate,
  requirePermission(PERMISSIONS.COUPON_DELETE),
  validateRequest({ params: couponIdParamsSchema }),
  couponController.restore,
);
