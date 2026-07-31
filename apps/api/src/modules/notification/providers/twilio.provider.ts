import { NotImplementedError } from "../../../errors";
import { SMS_PROVIDERS } from "../constants";

import type { NotificationDeliveryResult } from "../interfaces";
import type { SmsMessage, SmsProvider } from "./sms-provider.interface";

/** Configuration a real Twilio integration would need. */
export interface TwilioProviderConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

/**
 * `SmsProvider` implementation for Twilio — currently a skeleton.
 * `send` throws `NotImplementedError` rather than calling the Twilio
 * API (no `twilio` package is installed or imported here); wiring in
 * the real SDK is out of scope for this foundation.
 */
export class TwilioSmsProvider implements SmsProvider {
  readonly name = SMS_PROVIDERS.TWILIO;

  constructor(private readonly config: TwilioProviderConfig) {}

  async send(message: SmsMessage): Promise<NotificationDeliveryResult> {
    throw new NotImplementedError(
      `TwilioSmsProvider.send is not implemented yet (to: ${message.to})`,
    );
  }
}
