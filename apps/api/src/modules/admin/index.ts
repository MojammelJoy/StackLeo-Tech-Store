/**
 * The full Admin API: the one domain entity this foundation owns
 * outright (`SystemSetting`, now with a real repository/service/
 * controller/routes — see `types/system-setting.types.ts`), the
 * cross-cutting dashboard summary and static permission-mapping catalog
 * (`AdminService.getDashboardSummary`/`getPermissionMappings`, both now
 * real), plus this module's own additional layer: a richer, task-
 * specific dashboard overview and administrative management surfaces
 * for users/orders/reviews/notifications/payments (each reusing its own
 * domain module's real service/repository — see `service/`'s
 * individual doc comments) and for products/categories/brands/
 * inventory/coupons (each reusing its own domain module's real
 * controller directly — see `routes/`). Unlike the rest of this app's
 * foundations, `modules/admin` *is* meant to import sibling modules —
 * see `repository/admin-dashboard.repository.prisma.ts`'s doc comment
 * on why an administrative layer is the one place that's the intended
 * reuse, not a decoupling violation.
 */
export {
  ADMIN_ACTIONS,
  ADMIN_FILTERABLE_FIELDS,
  ADMIN_SORTABLE_FIELDS,
  MANAGEMENT_MODULES,
  SYSTEM_SETTING_DESCRIPTION_MAX_LENGTH,
  SYSTEM_SETTING_KEY_MAX_LENGTH,
  SYSTEM_SETTING_VALUE_MAX_LENGTH,
} from "./constants";
export type { AdminAction, ManagementModuleKey } from "./constants";

export type { CreateSystemSettingInput, SystemSetting, UpdateSystemSettingInput } from "./types";

export { descriptionSchema, systemSettingKeySchema, systemSettingValueSchema } from "./schemas";

export { createSystemSettingSchema, updateSystemSettingSchema } from "./validation";
export type {
  CreateSystemSettingDto,
  SystemSettingResponseDto,
  UpdateSystemSettingDto,
} from "./dto";

export type {
  AdminActionContext,
  AdminMapper,
  ManagementModuleDescriptor,
  SystemSettingFilterOptions,
} from "./interfaces";

export { DEFAULT_MANAGEMENT_MODULE_PERMISSIONS, buildPermissionKey } from "./permissions";
export type { ManagementModulePermissionMap } from "./permissions";

export type {
  DashboardSummary,
  DashboardSummaryDto,
  DashboardWidget,
  ModuleMetricSummary,
} from "./dashboards";

export { adminMapper } from "./mapper";

export { calculateGrowthRate, getManagementModuleCatalog, parseBooleanSetting } from "./utils";

export { AdminPrismaRepository } from "./repository";
export type { AdminRepository } from "./repository";

export { AdminService } from "./service";

export type { DashboardOverview } from "./types";
export type {
  DashboardOverviewResponseDto,
  NotificationSummaryResponseDto,
  PaymentStatusSummaryResponseDto,
  UpdateUserRolesDto,
  UpdateUserStatusDto,
} from "./dto";
export {
  systemSettingKeyParamsSchema,
  updateUserRolesSchema,
  updateUserStatusSchema,
} from "./validation";

export {
  AdminDashboardPrismaRepository,
  AdminOrderPrismaRepository,
  AdminReviewPrismaRepository,
  AdminNotificationPrismaRepository,
  AdminPaymentPrismaRepository,
} from "./repository";
export type {
  AdminDashboardRepository,
  AdminOrderRepository,
  AdminReviewRepository,
  AdminNotificationRepository,
  AdminPaymentRepository,
  PaymentStatusSummary,
} from "./repository";

export {
  AdminDashboardService,
  AdminUserService,
  AdminOrderService,
  AdminReviewService,
  AdminNotificationService,
  AdminPaymentService,
} from "./service";

export {
  AdminDashboardController,
  AdminSystemSettingController,
  AdminUserController,
  AdminOrderController,
  AdminReviewController,
  AdminNotificationController,
  AdminPaymentController,
} from "./controller";

export { adminRouter } from "./routes";
