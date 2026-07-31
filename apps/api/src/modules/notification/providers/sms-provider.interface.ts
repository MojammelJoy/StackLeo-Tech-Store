import type { SmsProviderName } from "../constants";
import type { NotificationDeliveryResult } from "../interfaces";

export interface SmsMessage {
  to: string;
  body: string;
}

/** The SMS-gateway abstraction every concrete provider (Twilio)
 * implements — see `EmailProvider`'s comment for the registry pattern
 * this mirrors. */
export interface SmsProvider {
  readonly name: SmsProviderName;
  send(message: SmsMessage): Promise<NotificationDeliveryResult>;
}
