import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { Notification, NotificationFilterOptions } from "../../notification";

/**
 * `modules/notification` is fully self-service end to end — every method
 * on its own `NotificationRepository`/`NotificationService` is scoped to
 * a single owning user, with no staff bypass anywhere (unlike
 * `modules/review`'s `review:moderate` visibility lift). Administrative
 * operational visibility therefore needs its own, entirely read-only
 * repository: listing across every user, and looking up any one
 * notification regardless of owner. Nothing here creates, mutates, or
 * delivers a notification — this module's Admin API is read-only for
 * notifications, per its own constraints (list/filter/inspect/summary
 * only).
 */
export interface AdminNotificationRepository {
  findAll(
    query: ParsedQuery,
    filters?: NotificationFilterOptions,
  ): Promise<PaginatedResult<Notification>>;
  findById(id: string): Promise<Notification | null>;
  /** Total unread, non-deleted notifications across every user — the
   * operational summary figure, one indexed `COUNT`. */
  countUnread(): Promise<number>;
}
