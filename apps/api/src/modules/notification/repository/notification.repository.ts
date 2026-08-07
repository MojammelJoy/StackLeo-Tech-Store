import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { NotificationFilterOptions } from "../interfaces";
import type { CreateNotificationInput, Notification } from "../types";

/** Read options every single-notification lookup accepts —
 * `includeDeleted` is only ever honored for the notification's own
 * owner (see `service/notification.service.ts`), never taken at face
 * value from a request, mirroring `modules/brand`'s `BrandLookupOptions`. */
export interface NotificationLookupOptions {
  includeDeleted?: boolean;
}

/**
 * Persistence contract for the Notification domain entity. The service
 * depends on this interface, never on a concrete implementation
 * directly, so swapping `NotificationPrismaRepository` for a test double
 * (or a different persistence layer entirely) never touches service
 * code.
 *
 * Deliberately narrower than the foundation skeleton's interface:
 * `findDueForDelivery` (what a future queue worker would poll) and
 * `update`/`updateStatus` (delivery-lifecycle transitions nothing in
 * this API ever drives — see `service/notification.service.ts`'s doc
 * comment) are dropped as unreachable from this API's actual surface;
 * `markRead`/`markUnread`/`markAllRead`/`countUnread`/`softDelete`/
 * `restore` are added for the read/unread and soft-delete features this
 * API does implement.
 */
export interface NotificationRepository {
  findById(id: string, options?: NotificationLookupOptions): Promise<Notification | null>;
  findByUserId(
    userId: string,
    query: ParsedQuery,
    filters?: NotificationFilterOptions,
  ): Promise<PaginatedResult<Notification>>;
  create(data: CreateNotificationInput): Promise<Notification>;
  markRead(id: string): Promise<Notification>;
  markUnread(id: string): Promise<Notification>;
  /** Marks every currently-unread, non-deleted notification owned by
   * `userId` as read in one statement — returns how many rows changed. */
  markAllRead(userId: string): Promise<number>;
  /** Soft delete — sets `deletedAt`, never removes the row. */
  softDelete(id: string): Promise<void>;
  /** Reverses `softDelete` — clears `deletedAt`. */
  restore(id: string): Promise<void>;
  /** "Provide an efficient unread count query" — a single indexed
   * `COUNT`, backed by `prisma/schema.prisma`'s
   * `@@index([userId, isRead, deletedAt])`. */
  countUnread(userId: string): Promise<number>;
}
