import { maskRecipient } from "../utils";

import type { NotificationResponseDto } from "../dto";
import type { NotificationMapper } from "../interfaces";
import type { Notification } from "../types";

function toResponseDto(notification: Notification): NotificationResponseDto {
  return {
    id: notification.id,
    userId: notification.userId,
    channel: notification.channel,
    type: notification.type,
    priority: notification.priority,
    status: notification.status,
    templateKey: notification.templateKey,
    subject: notification.subject,
    body: notification.body,
    recipient: maskRecipient(notification.channel, notification.recipient),
    metadata: notification.metadata,
    isRead: notification.isRead,
    readAt: notification.readAt,
    scheduledAt: notification.scheduledAt,
    sentAt: notification.sentAt,
    deliveredAt: notification.deliveredAt,
    failedAt: notification.failedAt,
    errorMessage: notification.errorMessage,
    retryCount: notification.retryCount,
    maxRetries: notification.maxRetries,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

function toResponseList(notifications: Notification[]): NotificationResponseDto[] {
  return notifications.map(toResponseDto);
}

/** The only place a `Notification` is converted to its public
 * response-DTO shape — callers map through this instead of building the
 * DTO by hand. */
export const notificationMapper: NotificationMapper = { toResponseDto, toResponseList };
