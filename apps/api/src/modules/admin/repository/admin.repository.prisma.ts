import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { DashboardSummary } from "../dashboards";
import type { SystemSettingFilterOptions } from "../interfaces";
import type { ManagementModulePermissionMap } from "../permissions";
import type { CreateSystemSettingInput, SystemSetting, UpdateSystemSettingInput } from "../types";
import type { AdminRepository } from "./admin.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `AdminRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `SystemSetting` model exists in
 * `prisma/schema.prisma` yet (and `getDashboardSummary`/
 * `getPermissionMappings` would need to query every other module's own
 * tables, none of which exist either); adding any of that is out of
 * scope for this foundation. Defaults to the shared `prisma` client from
 * `database/` (never constructs its own connection) so only the method
 * bodies are left to fill in once the underlying models exist.
 */
export class AdminPrismaRepository implements AdminRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findSystemSettingByKey(key: string): Promise<SystemSetting | null> {
    throw new NotImplementedError(
      `AdminPrismaRepository.findSystemSettingByKey is not implemented yet (key: ${key})`,
    );
  }

  async findAllSystemSettings(
    _query: ParsedQuery,
    _filters?: SystemSettingFilterOptions,
  ): Promise<PaginatedResult<SystemSetting>> {
    throw new NotImplementedError(
      "AdminPrismaRepository.findAllSystemSettings is not implemented yet",
    );
  }

  async createSystemSetting(_data: CreateSystemSettingInput): Promise<SystemSetting> {
    throw new NotImplementedError(
      "AdminPrismaRepository.createSystemSetting is not implemented yet",
    );
  }

  async updateSystemSetting(key: string, _data: UpdateSystemSettingInput): Promise<SystemSetting> {
    throw new NotImplementedError(
      `AdminPrismaRepository.updateSystemSetting is not implemented yet (key: ${key})`,
    );
  }

  async deleteSystemSetting(key: string): Promise<void> {
    throw new NotImplementedError(
      `AdminPrismaRepository.deleteSystemSetting is not implemented yet (key: ${key})`,
    );
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    throw new NotImplementedError(
      "AdminPrismaRepository.getDashboardSummary is not implemented yet",
    );
  }

  async getPermissionMappings(): Promise<ManagementModulePermissionMap[]> {
    throw new NotImplementedError(
      "AdminPrismaRepository.getPermissionMappings is not implemented yet",
    );
  }
}
