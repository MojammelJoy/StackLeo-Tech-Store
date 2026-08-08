import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { notificationIdParamsSchema } from "../../notification";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { AdminNotificationController } from "../controller";
import { AdminNotificationPrismaRepository } from "../repository";
import { AdminNotificationService } from "../service";

const adminNotificationRepository = new AdminNotificationPrismaRepository();
const adminNotificationService = new AdminNotificationService(adminNotificationRepository);
const adminNotificationController = new AdminNotificationController(adminNotificationService);

/**
 * Mounted at `/api/v1/admin/notifications`. Read-only — see
 * `service/admin-notification.service.ts`'s doc comment. Route order
 * matters: `/summary` is registered before the generic `/:id` so
 * Express never mistakes that literal segment for an `:id`.
 */
export const adminNotificationRouter: Router = Router();

adminNotificationRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  adminNotificationController.list,
);
adminNotificationRouter.get(
  "/summary",
  authenticate,
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  adminNotificationController.getSummary,
);
adminNotificationRouter.get(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.NOTIFICATION_READ),
  validateRequest({ params: notificationIdParamsSchema }),
  adminNotificationController.getById,
);
