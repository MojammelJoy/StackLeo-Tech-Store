import { sendSuccess } from "../../../common";
import { asyncHandler } from "../../../utils";

import type { AdminDashboardService, AdminService } from "../service";

/**
 * Express handlers for the admin dashboard. `getOverview` is this
 * module's own detailed, task-specific operational summary (per-status
 * order counts, low-stock count, review moderation queue size, etc. —
 * see `service/admin-dashboard.service.ts`); `getSummary`/
 * `getPermissionMappings` implement the foundation's own generic,
 * per-management-module contract (`AdminService.getDashboardSummary`/
 * `getPermissionMappings`) — both real, serving different granularities
 * rather than one replacing the other.
 */
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
    private readonly adminService: AdminService,
  ) {}

  getOverview = asyncHandler(async (_req, res) => {
    const overview = await this.adminDashboardService.getOverview();
    sendSuccess(res, { overview });
  });

  getSummary = asyncHandler(async (_req, res) => {
    const summary = await this.adminService.getDashboardSummary();
    sendSuccess(res, { summary });
  });

  getPermissionMappings = asyncHandler(async (_req, res) => {
    const permissions = await this.adminService.getPermissionMappings();
    sendSuccess(res, { permissions });
  });
}
