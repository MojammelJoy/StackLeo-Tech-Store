/**
 * A notification's delivery lifecycle. `QUEUED` and `SENDING` are
 * distinct from `PENDING` (created but not yet handed to a queue) and
 * from each other (waiting in the queue vs. actively being handed to a
 * provider) so a future queue implementation has somewhere to record
 * that distinction; `FAILED` combined with `retryCount`/`maxRetries`
 * (see `types/notification.types.ts`) is what
 * `utils/notification-status.util.ts`'s `isRetryable` checks.
 */
export const NOTIFICATION_STATUSES = {
  PENDING: "pending",
  QUEUED: "queued",
  SENDING: "sending",
  SENT: "sent",
  DELIVERED: "delivered",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[keyof typeof NOTIFICATION_STATUSES];
