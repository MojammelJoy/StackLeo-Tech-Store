/** How a notification reaches its recipient. `IN_APP` means the
 * recipient is a `userId` displayed inside the app itself, not an
 * external address — see `types/notification.types.ts`'s `recipient`
 * field, whose meaning depends on this value. */
export const NOTIFICATION_CHANNELS = {
  EMAIL: "email",
  SMS: "sms",
  PUSH: "push",
  IN_APP: "in_app",
} as const;

export type NotificationChannel =
  (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];
