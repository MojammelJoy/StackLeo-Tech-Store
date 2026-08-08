import { Router } from "express";

import { authenticate } from "../../../auth";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { AdminDashboardController } from "../controller";
import { AdminDashboardPrismaRepository, AdminPrismaRepository } from "../repository";
import { AdminDashboardService, AdminService } from "../service";

const adminDashboardRepository = new AdminDashboardPrismaRepository();
const adminDashboardService = new AdminDashboardService(adminDashboardRepository);

const adminRepository = new AdminPrismaRepository();
const adminService = new AdminService(adminRepository);

const adminDashboardController = new AdminDashboardController(adminDashboardService, adminService);

/** Mounted at `/api/v1/admin/dashboard`. */
export const adminDashboardRouter: Router = Router();

adminDashboardRouter.get(
  "/overview",
  authenticate,
  requirePermission(PERMISSIONS.ADMIN_DASHBOARD_READ),
  adminDashboardController.getOverview,
);
adminDashboardRouter.get(
  "/summary",
  authenticate,
  requirePermission(PERMISSIONS.ADMIN_DASHBOARD_READ),
  adminDashboardController.getSummary,
);
adminDashboardRouter.get(
  "/permissions",
  authenticate,
  requirePermission(PERMISSIONS.ADMIN_DASHBOARD_READ),
  adminDashboardController.getPermissionMappings,
);
