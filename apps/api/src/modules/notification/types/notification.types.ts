import type {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from "../constants";

/**
 * `userId` is a bare FK-shaped string, nullable for guest-directed or
 * system-wide notifications — this module never imports `modules/user`.
 * `recipient`'s shape depends on `channel`: an email address, a phone
 * number, a device token, or (for `IN_APP`) the same value as `userId`.
 * `metadata` is a flat string map for arbitrary context (e.g. an order
 * id a template placeholder needs) — deliberately not a relation to any
 * other module.
 */
export interface Notification {
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
  scheduledAt: Date | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  failedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
  userId?: string | null;
  channel: NotificationChannel;
  type: NotificationType;
  priority?: NotificationPriority;
  templateKey?: string | null;
  subject?: string | null;
  body: string;
  recipient: string;
  metadata?: Record<string, string> | null;
  scheduledAt?: Date | null;
  maxRetries?: number;
}

/**
 * Deliberately narrow — a notification's content and addressing
 * (`channel`/`recipient`/`body`) never change after creation; only its
 * delivery lifecycle does, mirroring `modules/payment`'s
 * `UpdatePaymentInput` narrowness.
 */
export interface UpdateNotificationInput {
  status?: NotificationStatus;
  sentAt?: Date | null;
  deliveredAt?: Date | null;
  failedAt?: Date | null;
  errorMessage?: string | null;
  retryCount?: number;
  nextRetryAt?: Date | null;
}
