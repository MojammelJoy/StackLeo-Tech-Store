import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { DashboardSummary } from "../dashboards";
import type { SystemSettingFilterOptions } from "../interfaces";
import type { ManagementModulePermissionMap } from "../permissions";
import type { CreateSystemSettingInput, SystemSetting, UpdateSystemSettingInput } from "../types";

/**
 * Persistence contract for the SystemSetting domain entity, plus the
 * two cross-cutting reads every admin panel needs: an aggregated
 * dashboard summary and the currently-configured permission mappings.
 * The service depends on this interface, never on a concrete
 * implementation directly, so swapping `AdminPrismaRepository` for a
 * test double (or a different persistence layer entirely) never touches
 * service code. `getDashboardSummary`/`getPermissionMappings` don't fit
 * naturally as CRUD on any one entity — that's why they live here
 * rather than being split across each management module's own
 * repository, which this foundation never imports.
 */
export interface AdminRepository {
  findSystemSettingByKey(key: string): Promise<SystemSetting | null>;
  findAllSystemSettings(
    query: ParsedQuery,
    filters?: SystemSettingFilterOptions,
  ): Promise<PaginatedResult<SystemSetting>>;
  createSystemSetting(data: CreateSystemSettingInput): Promise<SystemSetting>;
  updateSystemSetting(key: string, data: UpdateSystemSettingInput): Promise<SystemSetting>;
  deleteSystemSetting(key: string): Promise<void>;
  getDashboardSummary(): Promise<DashboardSummary>;
  getPermissionMappings(): Promise<ManagementModulePermissionMap[]>;
}
