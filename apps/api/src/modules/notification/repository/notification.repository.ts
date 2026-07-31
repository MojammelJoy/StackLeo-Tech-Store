import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { NotificationStatus } from "../constants";
import type { NotificationFilterOptions } from "../interfaces";
import type { CreateNotificationInput, Notification, UpdateNotificationInput } from "../types";

/**
 * Persistence contract for the Notification domain entity. The service
 * depends on this interface, never on a concrete implementation
 * directly, so swapping `NotificationPrismaRepository` for a test
 * double (or a different persistence layer entirely) never touches
 * service code. `findDueForDelivery` is what a future queue worker
 * would poll — scheduled notifications whose `scheduledAt` has arrived,
 * and failed ones whose `nextRetryAt` has arrived — kept separate from
 * `findAll` since it's a delivery-engine concern, not a listing one.
 */
export interface NotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findByUserId(
    userId: string,
    query: ParsedQuery,
    filters?: NotificationFilterOptions,
  ): Promise<PaginatedResult<Notification>>;
  findDueForDelivery(now: Date): Promise<Notification[]>;
  create(data: CreateNotificationInput): Promise<Notification>;
  update(id: string, data: UpdateNotificationInput): Promise<Notification>;
  updateStatus(id: string, status: NotificationStatus): Promise<Notification>;
}
