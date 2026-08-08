import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { AdminSystemSettingController } from "../controller";
import { AdminPrismaRepository } from "../repository";
import { AdminService } from "../service";
import {
  createSystemSettingSchema,
  systemSettingKeyParamsSchema,
  updateSystemSettingSchema,
} from "../validation";

const adminRepository = new AdminPrismaRepository();
const adminService = new AdminService(adminRepository);
const adminSystemSettingController = new AdminSystemSettingController(adminService);

/** Mounted at `/api/v1/admin/settings`. `system_settings:*` gates every
 * route — platform-wide configuration is never self-service. */
export const adminSystemSettingRouter: Router = Router();

adminSystemSettingRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.SYSTEM_SETTINGS_READ),
  adminSystemSettingController.list,
);
adminSystemSettingRouter.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.SYSTEM_SETTINGS_CREATE),
  validateRequest({ body: createSystemSettingSchema }),
  adminSystemSettingController.create,
);
adminSystemSettingRouter.get(
  "/:key",
  authenticate,
  requirePermission(PERMISSIONS.SYSTEM_SETTINGS_READ),
  validateRequest({ params: systemSettingKeyParamsSchema }),
  adminSystemSettingController.getByKey,
);
adminSystemSettingRouter.patch(
  "/:key",
  authenticate,
  requirePermission(PERMISSIONS.SYSTEM_SETTINGS_UPDATE),
  validateRequest({ params: systemSettingKeyParamsSchema, body: updateSystemSettingSchema }),
  adminSystemSettingController.update,
);
adminSystemSettingRouter.delete(
  "/:key",
  authenticate,
  requirePermission(PERMISSIONS.SYSTEM_SETTINGS_DELETE),
  validateRequest({ params: systemSettingKeyParamsSchema }),
  adminSystemSettingController.delete,
);
