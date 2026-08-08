import { NotFoundError } from "../../../errors";
import { notificationMapper } from "../../notification";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { NotificationFilterOptions, NotificationResponseDto } from "../../notification";
import type { NotificationSummaryResponseDto } from "../dto";
import type { AdminNotificationRepository } from "../repository";

/**
 * Administrative notification visibility — read-only, per this API's
 * constraints (no delivery, no mutation of another user's
 * notifications). Reads through `AdminNotificationRepository` (the
 * unscoped listing/lookup capability `modules/notification` doesn't
 * expose at all — see that repository's doc comment) and reuses
 * `modules/notification`'s own `notificationMapper` for response
 * shaping, so the public shape never drifts from what
 * `modules/notification` itself produces.
 */
export class AdminNotificationService {
  constructor(private readonly adminNotificationRepository: AdminNotificationRepository) {}

  async list(
    query: ParsedQuery,
    filters: NotificationFilterOptions,
  ): Promise<PaginatedResult<NotificationResponseDto>> {
    const result = await this.adminNotificationRepository.findAll(query, filters);
    return { items: notificationMapper.toResponseList(result.items), meta: result.meta };
  }

  async getById(id: string): Promise<NotificationResponseDto> {
    const notification = await this.adminNotificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }
    return notificationMapper.toResponseDto(notification);
  }

  async getSummary(): Promise<NotificationSummaryResponseDto> {
    const unreadCount = await this.adminNotificationRepository.countUnread();
    return { unreadCount };
  }
}
