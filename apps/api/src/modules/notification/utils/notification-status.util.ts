import { NOTIFICATION_STATUSES } from "../constants";

import type { NotificationStatus } from "../constants";
import type { Notification } from "../types";

const TERMINAL_STATUSES: readonly NotificationStatus[] = [
  NOTIFICATION_STATUSES.SENT,
  NOTIFICATION_STATUSES.DELIVERED,
  NOTIFICATION_STATUSES.FAILED,
  NOTIFICATION_STATUSES.CANCELLED,
];

/** Whether `notification` has reached a final state — no further
 * delivery attempt (successful or otherwise) will change its status. */
export function isTerminal(notification: Notification): boolean {
  return TERMINAL_STATUSES.includes(notification.status);
}

/** Whether `notification` failed but hasn't yet exhausted its retry
 * budget. */
export function isRetryable(notification: Notification): boolean {
  return (
    notification.status === NOTIFICATION_STATUSES.FAILED &&
    notification.retryCount < notification.maxRetries
  );
}
