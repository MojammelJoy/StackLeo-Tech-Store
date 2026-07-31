import type {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from "../constants";

/** Notification-specific filter criteria, layered on top of `common/`'s
 * generic `ParsedQuery` (pagination/sort/search). Shared between
 * `repository/` (the contract) and `service/` (the skeleton). */
export interface NotificationFilterOptions {
  channel?: NotificationChannel;
  type?: NotificationType;
  priority?: NotificationPriority;
  status?: NotificationStatus;
}
