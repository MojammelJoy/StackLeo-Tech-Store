import type {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from "../constants";

/** The public-facing shape of a Notification. `recipient` is masked
 * (via `mapper/` and `utils/recipient.util.ts`'s `maskRecipient`) —
 * never the raw email address/phone number/device token — since this
 * DTO is what a caller (e.g. an admin notification-history view) sees,
 * not what a provider sends to. `isRead`/`readAt`/`metadata` are this
 * module's own addition — see `types/notification.types.ts`'s
 * `Notification` doc comment. */
export interface NotificationResponseDto {
  id: string;
  userId: string | null;
  channel: NotificationChannel;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  templateKey: string | null;
  subject: string | null;
  body: string;
  recipient: string;
  metadata: Record<string, string> | null;
  isRead: boolean;
  readAt: Date | null;
  scheduledAt: Date | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  failedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}
