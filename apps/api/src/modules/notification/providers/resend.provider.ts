import { NotImplementedError } from "../../../errors";
import { EMAIL_PROVIDERS } from "../constants";

import type { NotificationDeliveryResult } from "../interfaces";
import type { EmailMessage, EmailProvider } from "./email-provider.interface";

/**
 * Configuration a real Resend integration would need. Deliberately not
 * sourced from the shared `config/` module — this is a skeleton with no
 * actual Resend SDK call anywhere in it (out of scope for this
 * foundation), so requiring real credentials to even construct this
 * class would force every environment to configure a service nothing
 * here uses yet.
 */
export interface ResendProviderConfig {
  apiKey: string;
  fromAddress: string;
}

/**
 * `EmailProvider` implementation for Resend — currently a skeleton.
 * `send` throws `NotImplementedError` rather than calling the Resend
 * API (no `resend` package is installed or imported here); wiring in
 * the real SDK is out of scope for this foundation.
 */
export class ResendEmailProvider implements EmailProvider {
  readonly name = EMAIL_PROVIDERS.RESEND;

  constructor(private readonly config: ResendProviderConfig) {}

  async send(message: EmailMessage): Promise<NotificationDeliveryResult> {
    throw new NotImplementedError(
      `ResendEmailProvider.send is not implemented yet (to: ${message.to})`,
    );
  }
}
