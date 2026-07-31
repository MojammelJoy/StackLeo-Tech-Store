/**
 * Reusable admin infrastructure: the one domain entity Admin actually
 * owns (`SystemSetting` — see `types/system-setting.types.ts`), DTOs +
 * Zod validation schemas built from reusable field-level schemas in
 * `schemas/`, the repository contract (plus its currently-skeletal
 * Prisma implementation), a skeleton service, the admin mapper, a
 * static catalog of the 15 management areas this app supports (see
 * `utils/management-module-catalog.util.ts`) with their default
 * action-to-permission-key mappings (see `permissions/`), decoupled
 * dashboard summary shapes (see `dashboards/`), and the
 * setting/growth-rate utilities that support it all. No controllers,
 * routes, business logic, actual dashboard aggregation, report
 * generation, or audit-log implementation live here — and no sibling
 * module (`modules/user`, `modules/product`, `modules/rbac`, etc.) is
 * ever imported, the same cross-module decoupling every foundation in
 * this app follows.
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
