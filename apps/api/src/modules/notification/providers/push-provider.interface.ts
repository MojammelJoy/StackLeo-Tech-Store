import type { PushProviderName } from "../constants";
import type { NotificationDeliveryResult } from "../interfaces";

export interface PushMessage {
  deviceToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

/** The push-gateway abstraction every concrete provider (Firebase)
 * implements — see `EmailProvider`'s comment for the registry pattern
 * this mirrors. */
export interface PushProvider {
  readonly name: PushProviderName;
  send(message: PushMessage): Promise<NotificationDeliveryResult>;
}
