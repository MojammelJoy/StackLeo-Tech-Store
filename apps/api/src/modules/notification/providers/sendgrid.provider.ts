import { NotImplementedError } from "../../../errors";
import { EMAIL_PROVIDERS } from "../constants";

import type { NotificationDeliveryResult } from "../interfaces";
import type { EmailMessage, EmailProvider } from "./email-provider.interface";

/** Configuration a real SendGrid integration would need. */
export interface SendgridProviderConfig {
  apiKey: string;
  fromAddress: string;
}

/**
 * `EmailProvider` implementation for SendGrid — currently a skeleton.
 * `send` throws `NotImplementedError` rather than calling the SendGrid
 * API (no SendGrid SDK/package is installed or imported here); wiring
 * in the real integration is out of scope for this foundation.
 */
export class SendgridEmailProvider implements EmailProvider {
  readonly name = EMAIL_PROVIDERS.SENDGRID;

  constructor(private readonly config: SendgridProviderConfig) {}

  async send(message: EmailMessage): Promise<NotificationDeliveryResult> {
    throw new NotImplementedError(
      `SendgridEmailProvider.send is not implemented yet (to: ${message.to})`,
    );
  }
}
