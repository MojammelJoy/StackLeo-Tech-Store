import type { NotificationChannel, NotificationPriority, NotificationType } from "../constants";

/**
 * A single logical notification fanned out across more than one
 * channel at once (e.g. "email + push" for an urgent account alert).
 * `service/notification.service.ts`'s `dispatchMultiChannel` turns one
 * of these into one `Notification` record per requested channel —
 * that's what "multi-channel delivery" means in this foundation, as
 * opposed to a single `Notification`, which always belongs to exactly
 * one channel (see `types/notification.types.ts`).
 */
export interface MultiChannelNotificationRequest {
  userId?: string | null;
  channels: NotificationChannel[];
  type: NotificationType;
  priority?: NotificationPriority;
  templateKey?: string | null;
  variables?: Record<string, string>;
  recipients: Partial<Record<NotificationChannel, string>>;
}
