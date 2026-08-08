import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { UserPrismaRepository, userIdParamsSchema } from "../../user";
import { AdminUserController } from "../controller";
import { AdminUserService } from "../service";
import { updateUserRolesSchema, updateUserStatusSchema } from "../validation";

const userRepository = new UserPrismaRepository();
const adminUserService = new AdminUserService(userRepository);
const adminUserController = new AdminUserController(adminUserService);

/**
 * Mounted at `/api/v1/admin/users`. `PATCH /:id/roles` requires the
 * stricter `rbac:manage` (not `user:update`) — see
 * `service/admin-user.service.ts`'s doc comment on why role assignment
 * is gated separately from every other administrative user field.
 */
export const adminUserRouter: Router = Router();

adminUserRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.USER_READ),
  adminUserController.list,
);
adminUserRouter.get(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.USER_READ),
  validateRequest({ params: userIdParamsSchema }),
  adminUserController.getById,
);
adminUserRouter.patch(
  "/:id/status",
  authenticate,
  requirePermission(PERMISSIONS.USER_UPDATE),
  validateRequest({ params: userIdParamsSchema, body: updateUserStatusSchema }),
  adminUserController.setActive,
);
adminUserRouter.patch(
  "/:id/roles",
  authenticate,
  requirePermission(PERMISSIONS.RBAC_MANAGE),
  validateRequest({ params: userIdParamsSchema, body: updateUserRolesSchema }),
  adminUserController.updateRoles,
);
