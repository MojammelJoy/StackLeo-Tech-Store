import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { NOTIFICATION_PRIORITIES, NOTIFICATION_STATUSES } from "../constants";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from "../constants";
import type { NotificationFilterOptions } from "../interfaces";
import type { CreateNotificationInput, Notification } from "../types";
import type { NotificationLookupOptions, NotificationRepository } from "./notification.repository";
import type { Notification as PrismaNotification, Prisma, PrismaClient } from "@prisma/client";

/** Prisma's generated model type stores `channel`/`type`/`priority`/
 * `status` as plain `string` (they're `String` columns, not native
 * Postgres enums — see `prisma/schema.prisma`'s doc comment on
 * `Notification`, which mirrors `Product`/`Payment`). `metadata` comes
 * back as `Prisma.JsonValue`; every row only ever got there through
 * this repository writing either `null` or a flat string map, so the
 * cast back is safe. */
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

function toDomainNotificationList(rows: PrismaNotification[]): Notification[] {
  return rows.map(toDomainNotification);
}

/**
 * Prisma-backed implementation of `NotificationRepository`. Defaults to
 * the shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 *
 * No method here uses `$transaction`: every write is already a single
 * atomic statement (`update`/`updateMany`/`create`), and this module has
 * no cached aggregate or second table to keep in sync with a
 * `Notification` write — unlike `modules/coupon`'s usage-count ledger or
 * a rating-summary cache, "efficient unread count" here is just an
 * indexed `COUNT`, not a materialized value that needs updating
 * alongside every write. Mirrors `modules/brand`'s repository doc
 * comment for the same "flat entity, nothing to keep in sync" reason.
 */
export class NotificationPrismaRepository implements NotificationRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(
    id: string,
    options: NotificationLookupOptions = {},
  ): Promise<Notification | null> {
    const row = await this.prismaClient.notification.findUnique({ where: { id } });
    if (!row || (row.deletedAt && !options.includeDeleted)) {
      return null;
    }
    return toDomainNotification(row);
  }

  async findByUserId(
    userId: string,
    query: ParsedQuery,
    filters: NotificationFilterOptions = {},
  ): Promise<PaginatedResult<Notification>> {
    const where = buildWhere(userId, filters, query.search);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.notification.findMany({ where, orderBy, skip, take }),
      this.prismaClient.notification.count({ where }),
    ]);

    return {
      items: toDomainNotificationList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  /**
   * Every notification created through this API is `IN_APP` (enforced
   * by `service/notification.service.ts` before this is ever called) —
   * an in-app record has no separate "handed off to a provider" step
   * the way email/SMS/push do, so it's `DELIVERED` (and `deliveredAt`
   * stamped) the instant it exists, not `PENDING`. This is the one place
   * that's decided, rather than trusting `data` for it, since nothing
   * else in this API's scope could plausibly produce a different
   * initial status.
   */
  async create(data: CreateNotificationInput): Promise<Notification> {
    const row = await this.prismaClient.notification.create({
      data: {
        userId: data.userId ?? null,
        channel: data.channel,
        type: data.type,
        priority: data.priority ?? NOTIFICATION_PRIORITIES.NORMAL,
        status: NOTIFICATION_STATUSES.DELIVERED,
        templateKey: data.templateKey ?? null,
        subject: data.subject ?? null,
        body: data.body,
        recipient: data.recipient,
        metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        scheduledAt: data.scheduledAt ?? null,
        deliveredAt: new Date(),
        maxRetries: data.maxRetries ?? 0,
      },
    });
    return toDomainNotification(row);
  }

  async markRead(id: string): Promise<Notification> {
    const row = await this.prismaClient.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return toDomainNotification(row);
  }

  async markUnread(id: string): Promise<Notification> {
    const row = await this.prismaClient.notification.update({
      where: { id },
      data: { isRead: false, readAt: null },
    });
    return toDomainNotification(row);
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await this.prismaClient.notification.updateMany({
      where: { userId, isRead: false, deletedAt: null },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count;
  }

  async softDelete(id: string): Promise<void> {
    await this.prismaClient.notification.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string): Promise<void> {
    await this.prismaClient.notification.update({ where: { id }, data: { deletedAt: null } });
  }

  async countUnread(userId: string): Promise<number> {
    return this.prismaClient.notification.count({
      where: { userId, isRead: false, deletedAt: null },
    });
  }
}

function buildWhere(
  userId: string,
  filters: NotificationFilterOptions,
  search?: string,
): Prisma.NotificationWhereInput {
  const conditions: Prisma.NotificationWhereInput[] = [{ userId }, { deletedAt: null }];

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
