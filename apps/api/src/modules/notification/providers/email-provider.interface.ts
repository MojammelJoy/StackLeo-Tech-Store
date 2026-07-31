import type { EmailProviderName } from "../constants";
import type { NotificationDeliveryResult } from "../interfaces";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * The email-gateway abstraction every concrete provider (Resend,
 * SendGrid) implements. `service/notification.service.ts` depends on
 * this interface — via a registry keyed by `EmailProviderName` — never
 * on a concrete provider directly, mirroring `modules/payment`'s
 * `PaymentProvider` registry pattern. Adding a third email gateway later
 * means adding one more class that satisfies this shape, not touching
 * the service.
 */
export interface EmailProvider {
  readonly name: EmailProviderName;
  send(message: EmailMessage): Promise<NotificationDeliveryResult>;
}
