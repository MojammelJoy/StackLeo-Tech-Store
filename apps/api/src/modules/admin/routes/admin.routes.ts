import { Router } from "express";

import { inventoryRouter } from "../../inventory";

import { adminBrandRouter } from "./admin-brand.routes";
import { adminCategoryRouter } from "./admin-category.routes";
import { adminCouponRouter } from "./admin-coupon.routes";
import { adminDashboardRouter } from "./admin-dashboard.routes";
import { adminNotificationRouter } from "./admin-notification.routes";
import { adminOrderRouter } from "./admin-order.routes";
import { adminPaymentRouter } from "./admin-payment.routes";
import { adminProductRouter } from "./admin-product.routes";
import { adminReviewRouter } from "./admin-review.routes";
import { adminSystemSettingRouter } from "./admin-system-setting.routes";
import { adminUserRouter } from "./admin-user.routes";

/**
 * The full Admin API surface, mounted at `/api/v1/admin` (see
 * `routes/v1/index.ts`). Every sub-router requires `authenticate` plus
 * an appropriate existing (or admin-added) permission on every single
 * route, reads included — there is no anonymous or self-service path
 * anywhere under this namespace, unlike the public routers this module
 * builds on. `/inventory` reuses `modules/inventory`'s own
 * `inventoryRouter` unchanged: unlike Product/Category/Brand/Coupon,
 * every one of its routes was already `authenticate` +
 * `requirePermission`-gated (inventory has no public or self-service
 * subset at all — see `PERMISSIONS.INVENTORY_READ`'s doc comment), so
 * there is nothing stricter this namespace needs to add.
 */
export const adminRouter: Router = Router();

adminRouter.use("/dashboard", adminDashboardRouter);
adminRouter.use("/users", adminUserRouter);
adminRouter.use("/products", adminProductRouter);
adminRouter.use("/categories", adminCategoryRouter);
adminRouter.use("/brands", adminBrandRouter);
adminRouter.use("/inventory", inventoryRouter);
adminRouter.use("/orders", adminOrderRouter);
adminRouter.use("/reviews", adminReviewRouter);
adminRouter.use("/notifications", adminNotificationRouter);
adminRouter.use("/coupons", adminCouponRouter);
adminRouter.use("/payments", adminPaymentRouter);
adminRouter.use("/settings", adminSystemSettingRouter);
