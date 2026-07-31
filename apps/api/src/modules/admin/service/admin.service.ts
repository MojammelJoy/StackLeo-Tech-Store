import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { DashboardSummary } from "../dashboards";
import type { CreateSystemSettingDto, UpdateSystemSettingDto } from "../dto";
import type { SystemSettingFilterOptions } from "../interfaces";
import type { ManagementModulePermissionMap } from "../permissions";
import type { AdminRepository } from "../repository";
import type { SystemSetting } from "../types";

/**
 * Skeleton admin service — the operations a concrete implementation
 * will expose once system-setting persistence and the cross-module
 * aggregation behind `getDashboardSummary`/`getPermissionMappings`
 * exist. Depends on `AdminRepository` (interface only; see
 * `repository/`) for persistence. Every method throws
 * `NotImplementedError` — no database operations and no business rules
 * (how to compute dashboard metrics, how to resolve effective
 * permissions, how to validate a setting's value against its own past
 * type) happen in this foundation.
 *
 * Write operations accept `actor: AuthenticatedUser` — every admin
 * action is, by definition, performed by an authenticated staff member,
 * unlike several other foundations' guest-accessible writes — so a
 * future concrete implementation can attribute changes (audit logging;
 * see `constants/management-module.constants.ts`'s `AUDIT_LOG` entry)
 * without every call site's signature changing later. Nothing here
 * checks `actor`'s permissions; resolving whether `actor` may perform a
 * given action against a given `ManagementModulePermissionMap` entry is
 * `modules/rbac`'s job, applied by whatever middleware sits in front of
 * this service once it exists.
 */
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async getSystemSetting(key: string): Promise<SystemSetting | null> {
    throw new NotImplementedError(
      `AdminService.getSystemSetting is not implemented yet (key: ${key})`,
    );
  }

  async listSystemSettings(
    _query: ParsedQuery,
    _filters?: SystemSettingFilterOptions,
  ): Promise<PaginatedResult<SystemSetting>> {
    throw new NotImplementedError("AdminService.listSystemSettings is not implemented yet");
  }

  async createSystemSetting(
    _dto: CreateSystemSettingDto,
    _actor: AuthenticatedUser,
  ): Promise<SystemSetting> {
    throw new NotImplementedError("AdminService.createSystemSetting is not implemented yet");
  }

  async updateSystemSetting(
    key: string,
    _dto: UpdateSystemSettingDto,
    _actor: AuthenticatedUser,
  ): Promise<SystemSetting> {
    throw new NotImplementedError(
      `AdminService.updateSystemSetting is not implemented yet (key: ${key})`,
    );
  }

  async deleteSystemSetting(key: string, _actor: AuthenticatedUser): Promise<void> {
    throw new NotImplementedError(
      `AdminService.deleteSystemSetting is not implemented yet (key: ${key})`,
    );
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    throw new NotImplementedError("AdminService.getDashboardSummary is not implemented yet");
  }

  async getPermissionMappings(): Promise<ManagementModulePermissionMap[]> {
    throw new NotImplementedError("AdminService.getPermissionMappings is not implemented yet");
  }
}
