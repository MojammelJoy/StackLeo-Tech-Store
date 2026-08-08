import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { MANAGEMENT_MODULES } from "../constants";
import { DEFAULT_MANAGEMENT_MODULE_PERMISSIONS } from "../permissions";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type { DashboardSummary, ModuleMetricSummary } from "../dashboards";
import type { SystemSettingFilterOptions } from "../interfaces";
import type { ManagementModulePermissionMap } from "../permissions";
import type { CreateSystemSettingInput, SystemSetting, UpdateSystemSettingInput } from "../types";
import type { AdminRepository } from "./admin.repository";
import type { Prisma, PrismaClient, SystemSetting as PrismaSystemSetting } from "@prisma/client";

const NEW_SINCE_PERIOD_MS = 24 * 60 * 60 * 1000;

function toDomainSystemSetting(row: PrismaSystemSetting): SystemSetting {
  return { ...row };
}

/**
 * One module's `{ totalCount, newSinceLastPeriod }` pair — `count()`
 * plus one indexed `count({ where: { createdAt: { gte } } })`, both
 * lightweight and bounded, never a full-table scan. `newSinceLastPeriod`
 * is deliberately a single fixed 24-hour window, not a
 * period-over-period trend/growth-rate calculation (`calculateGrowthRate`
 * exists in `utils/` but is never applied here) — that comparison is
 * Analytics API territory; this stays "how many showed up today", an
 * operational fact, not a historical analysis.
 */
async function countModule(
  model: { count: (args?: { where?: Record<string, unknown> }) => Promise<number> },
  extraWhere: Record<string, unknown> = {},
): Promise<{ totalCount: number; newSinceLastPeriod: number }> {
  const since = new Date(Date.now() - NEW_SINCE_PERIOD_MS);
  const [totalCount, newSinceLastPeriod] = await Promise.all([
    model.count({ where: extraWhere }),
    model.count({ where: { ...extraWhere, createdAt: { gte: since } } }),
  ]);
  return { totalCount, newSinceLastPeriod };
}

/**
 * Prisma-backed implementation of `AdminRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class AdminPrismaRepository implements AdminRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findSystemSettingByKey(key: string): Promise<SystemSetting | null> {
    const row = await this.prismaClient.systemSetting.findUnique({ where: { key } });
    return row ? toDomainSystemSetting(row) : null;
  }

  async findAllSystemSettings(
    query: ParsedQuery,
    filters: SystemSettingFilterOptions = {},
  ): Promise<PaginatedResult<SystemSetting>> {
    const where = buildWhere(filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.systemSetting.findMany({ where, orderBy, skip, take }),
      this.prismaClient.systemSetting.count({ where }),
    ]);

    return {
      items: rows.map(toDomainSystemSetting),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async createSystemSetting(data: CreateSystemSettingInput): Promise<SystemSetting> {
    const row = await this.prismaClient.systemSetting.create({
      data: {
        key: data.key,
        value: data.value,
        description: data.description ?? null,
        updatedBy: data.updatedBy ?? null,
      },
    });
    return toDomainSystemSetting(row);
  }

  async updateSystemSetting(key: string, data: UpdateSystemSettingInput): Promise<SystemSetting> {
    const row = await this.prismaClient.systemSetting.update({
      where: { key },
      data: {
        value: data.value,
        description: data.description,
        updatedBy: data.updatedBy,
      },
    });
    return toDomainSystemSetting(row);
  }

  async deleteSystemSetting(key: string): Promise<void> {
    await this.prismaClient.systemSetting.delete({ where: { key } });
  }

  /**
   * One `{ totalCount, newSinceLastPeriod }` pair per management module
   * that owns a real table — issued in parallel via `Promise.all`, never
   * loading a full table into memory. `ROLE_PERMISSION` (roles are
   * static in-code, not a database table), `REPORTS`, and `AUDIT_LOG`
   * (no backing table exists — see `AdminService`'s doc comment on
   * audit logging) are omitted entirely rather than reported as `0`,
   * which would misleadingly imply "empty" instead of "not tracked".
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    const [
      users,
      products,
      categories,
      brands,
      inventory,
      orders,
      payments,
      coupons,
      reviews,
      notifications,
      systemSettings,
    ] = await Promise.all([
      countModule(this.prismaClient.user),
      countModule(this.prismaClient.product, { deletedAt: null }),
      countModule(this.prismaClient.category, { deletedAt: null }),
      countModule(this.prismaClient.brand, { deletedAt: null }),
      countModule(this.prismaClient.inventoryItem),
      countModule(this.prismaClient.order),
      countModule(this.prismaClient.payment),
      countModule(this.prismaClient.coupon, { deletedAt: null }),
      countModule(this.prismaClient.review, { deletedAt: null }),
      countModule(this.prismaClient.notification, { deletedAt: null }),
      countModule(this.prismaClient.systemSetting),
    ]);

    const metrics: ModuleMetricSummary[] = [
      { module: MANAGEMENT_MODULES.USER, ...users },
      { module: MANAGEMENT_MODULES.PRODUCT, ...products },
      { module: MANAGEMENT_MODULES.CATEGORY, ...categories },
      { module: MANAGEMENT_MODULES.BRAND, ...brands },
      { module: MANAGEMENT_MODULES.INVENTORY, ...inventory },
      { module: MANAGEMENT_MODULES.ORDER, ...orders },
      { module: MANAGEMENT_MODULES.PAYMENT, ...payments },
      { module: MANAGEMENT_MODULES.COUPON, ...coupons },
      { module: MANAGEMENT_MODULES.REVIEW, ...reviews },
      { module: MANAGEMENT_MODULES.NOTIFICATION, ...notifications },
      { module: MANAGEMENT_MODULES.SYSTEM_SETTINGS, ...systemSettings },
    ];

    return { generatedAt: new Date(), metrics };
  }

  /** `DEFAULT_MANAGEMENT_MODULE_PERMISSIONS` already *is* the complete,
   * static action-to-permission-key catalog (see that constant's doc
   * comment) — there is no per-installation override mechanism in this
   * foundation, so returning it directly is the real, correct
   * implementation, not a placeholder. */
  async getPermissionMappings(): Promise<ManagementModulePermissionMap[]> {
    return DEFAULT_MANAGEMENT_MODULE_PERMISSIONS;
  }
}

function buildWhere(
  filters: SystemSettingFilterOptions,
  search?: string,
): Prisma.SystemSettingWhereInput {
  const conditions: Prisma.SystemSettingWhereInput[] = [];

  if (filters.keyPrefix) {
    conditions.push({ key: { startsWith: filters.keyPrefix } });
  }

  if (search) {
    conditions.push({
      OR: [
        { key: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

/** Always appends a `key` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring every other
 * module's Prisma repository (which use `id` for the same reason —
 * `SystemSetting` has no separate `id`, `key` is its primary key). */
function buildOrderBy(sort: SortParam[]): Prisma.SystemSettingOrderByWithRelationInput[] {
  if (sort.length === 0) {
    return [{ createdAt: "desc" }, { key: "asc" }];
  }
  return [...sort.map(({ field, order }) => ({ [field]: order })), { key: "asc" }];
}
