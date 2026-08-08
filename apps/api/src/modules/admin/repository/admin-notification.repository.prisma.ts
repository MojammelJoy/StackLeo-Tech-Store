import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";

import type { AdminNotificationRepository } from "./admin-notification.repository";
import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type {
  Notification,
  NotificationChannel,
  NotificationFilterOptions,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from "../../notification";
import type { Notification as PrismaNotification, Prisma, PrismaClient } from "@prisma/client";

/** Mirrors `modules/notification/repository/notification.repository.prisma.ts`'s
 * private `toDomainNotification` exactly (that function isn't exported —
 * this module never imports another module's internals, only its
 * public types/constants/services) — every row only ever got there
 * through that module's own repository, so the same cast back is safe
 * here. */
function toDomainNotification(row: PrismaNotification): Notification {
  return {
    ...row,
    channel: row.channel as NotificationChannel,
    type: row.type as NotificationType,
    priority: row.priority as NotificationPriority,
    status: row.status as NotificationStatus,
    metadata: row.metadata as unknown as Record<string, string> | null,
  };
}

/**
 * Prisma-backed implementation of `AdminNotificationRepository`.
 * Defaults to the shared `prisma` client from `database/` (never
 * constructs its own connection), matching every other module's Prisma
 * repository.
 */
export class AdminNotificationPrismaRepository implements AdminNotificationRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findAll(
    query: ParsedQuery,
    filters: NotificationFilterOptions = {},
  ): Promise<PaginatedResult<Notification>> {
    const where = buildWhere(filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.notification.findMany({ where, orderBy, skip, take }),
      this.prismaClient.notification.count({ where }),
    ]);

    return {
      items: rows.map(toDomainNotification),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async findById(id: string): Promise<Notification | null> {
    const row = await this.prismaClient.notification.findUnique({ where: { id } });
    return row ? toDomainNotification(row) : null;
  }

  async countUnread(): Promise<number> {
    return this.prismaClient.notification.count({ where: { isRead: false, deletedAt: null } });
  }
}

function buildWhere(
  filters: NotificationFilterOptions,
  search?: string,
): Prisma.NotificationWhereInput {
  const conditions: Prisma.NotificationWhereInput[] = [{ deletedAt: null }];

  if (filters.channel) {
    conditions.push({ channel: filters.channel });
  }
  if (filters.type) {
    conditions.push({ type: filters.type });
  }
  if (filters.priority) {
    conditions.push({ priority: filters.priority });
  }
  if (filters.status) {
    conditions.push({ status: filters.status });
  }

  if (search) {
    conditions.push({
      OR: [
        { subject: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  return { AND: conditions };
}

/** Always appends an `id` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring every other
 * module's Prisma repository. */
function buildOrderBy(sort: SortParam[]): Prisma.NotificationOrderByWithRelationInput[] {
  if (sort.length === 0) {
    return [{ createdAt: "desc" }, { id: "asc" }];
  }
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
