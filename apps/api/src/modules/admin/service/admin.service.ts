import { ConflictError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { DashboardSummary } from "../dashboards";
import type { CreateSystemSettingDto, UpdateSystemSettingDto } from "../dto";
import type { SystemSettingFilterOptions } from "../interfaces";
import type { ManagementModulePermissionMap } from "../permissions";
import type { AdminRepository } from "../repository";
import type { SystemSetting } from "../types";

/**
 * Administers `SystemSetting` — the one domain entity this module owns
 * outright (see `types/system-setting.types.ts`'s doc comment) — plus
 * the two cross-cutting reads every admin panel needs: the operational
 * dashboard summary and the static permission-mapping catalog. Depends
 * on `AdminRepository` (interface only; see `repository/`), never on
 * Prisma directly.
 *
 * `createSystemSetting`/`updateSystemSetting` both stamp `updatedBy`
 * from the real authenticated `actor` — never a client-supplied value —
 * so a setting's audit trail (who last touched it) can never be
 * spoofed.
 */
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async getSystemSetting(key: string): Promise<SystemSetting> {
    const setting = await this.adminRepository.findSystemSettingByKey(key);
    if (!setting) {
      throw new NotFoundError("System setting not found");
    }
    return setting;
  }

  async listSystemSettings(
    query: ParsedQuery,
    filters: SystemSettingFilterOptions,
  ): Promise<PaginatedResult<SystemSetting>> {
    return this.adminRepository.findAllSystemSettings(query, filters);
  }

  async createSystemSetting(
    dto: CreateSystemSettingDto,
    actor: AuthenticatedUser,
  ): Promise<SystemSetting> {
    const existing = await this.adminRepository.findSystemSettingByKey(dto.key);
    if (existing) {
      throw new ConflictError(`A system setting with key "${dto.key}" already exists`);
    }

    const setting = await this.adminRepository.createSystemSetting({
      key: dto.key,
      value: dto.value,
      description: dto.description ?? null,
      updatedBy: actor.id,
    });
    logger.info({ key: setting.key, actorId: actor.id }, "System setting created");
    return setting;
  }

  async updateSystemSetting(
    key: string,
    dto: UpdateSystemSettingDto,
    actor: AuthenticatedUser,
  ): Promise<SystemSetting> {
    await this.getSystemSetting(key);

    const updated = await this.adminRepository.updateSystemSetting(key, {
      ...dto,
      updatedBy: actor.id,
    });
    logger.info({ key, actorId: actor.id }, "System setting updated");
    return updated;
  }

  async deleteSystemSetting(key: string, actor: AuthenticatedUser): Promise<void> {
    await this.getSystemSetting(key);

    await this.adminRepository.deleteSystemSetting(key);
    logger.info({ key, actorId: actor.id }, "System setting deleted");
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.adminRepository.getDashboardSummary();
  }

  async getPermissionMappings(): Promise<ManagementModulePermissionMap[]> {
    return this.adminRepository.getPermissionMappings();
  }
}
