import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { NotificationController } from "../controller";
import { NotificationPrismaRepository } from "../repository";
import { NotificationService } from "../service";
import { createInAppNotificationSchema, notificationIdParamsSchema } from "../validation";

const notificationRepository = new NotificationPrismaRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

/**
 * The full Notification API surface, mounted at `/api/v1/notifications`
 * (see `routes/v1/index.ts`). Every endpoint requires `authenticate` —
 * this module has no guest/public path at all, per this API's
 * "authenticated users only" requirement (mirroring `modules/payment`).
 * No `requirePermission` gate anywhere: "users can access only their
 * own notifications" is enforced entirely by `NotificationService`'s
 * ownership checks, and this API defines no staff/admin capability
 * (unlike `modules/coupon`/`modules/review`) — there is nothing here for
 * a permission to gate.
 *
 * Route order matters: `/unread-count` and `/mark-all-read` are
 * registered before the generic `/:id` so Express never mistakes one of
 * those literal segments for an `:id`.
 */
export const notificationRouter: Router = Router();

notificationRouter.post(
  "/",
  authenticate,
  validateRequest({ body: createInAppNotificationSchema }),
  notificationController.create,
);
notificationRouter.get("/", authenticate, notificationController.list);

notificationRouter.get("/unread-count", authenticate, notificationController.getUnreadCount);
notificationRouter.post("/mark-all-read", authenticate, notificationController.markAllRead);

notificationRouter.get(
  "/:id",
  authenticate,
  validateRequest({ params: notificationIdParamsSchema }),
  notificationController.getById,
);
notificationRouter.post(
  "/:id/read",
  authenticate,
  validateRequest({ params: notificationIdParamsSchema }),
  notificationController.markRead,
);
notificationRouter.post(
  "/:id/unread",
  authenticate,
  validateRequest({ params: notificationIdParamsSchema }),
  notificationController.markUnread,
);
notificationRouter.delete(
  "/:id",
  authenticate,
  validateRequest({ params: notificationIdParamsSchema }),
  notificationController.delete,
);
notificationRouter.post(
  "/:id/restore",
  authenticate,
  validateRequest({ params: notificationIdParamsSchema }),
  notificationController.restore,
);
