/** What any provider (`providers/`'s `EmailProvider`/`SmsProvider`/
 * `PushProvider`) returns after attempting delivery — one shared shape
 * so `service/notification.service.ts` can handle the outcome uniformly
 * regardless of channel. */
export interface NotificationDeliveryResult {
  success: boolean;
  providerRef: string | null;
  errorMessage: string | null;
}
