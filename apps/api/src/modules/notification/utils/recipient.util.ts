import { NOTIFICATION_CHANNELS } from "../constants";

import type { NotificationChannel } from "../constants";

const MASKED_LOCAL_PART_LENGTH = 2;
const MASKED_PHONE_SUFFIX_LENGTH = 4;

/** Renders `recipient` safe to log or display without exposing the full
 * email address/phone number/device token — used by `mapper/` when
 * building a `NotificationResponseDto`. */
export function maskRecipient(channel: NotificationChannel, recipient: string): string {
  if (channel === NOTIFICATION_CHANNELS.EMAIL) {
    const [localPart, domain] = recipient.split("@");
    if (!localPart || !domain) {
      return recipient;
    }
    return `${localPart.slice(0, MASKED_LOCAL_PART_LENGTH)}***@${domain}`;
  }

  if (channel === NOTIFICATION_CHANNELS.SMS) {
    return recipient.length > MASKED_PHONE_SUFFIX_LENGTH
      ? `***${recipient.slice(-MASKED_PHONE_SUFFIX_LENGTH)}`
      : recipient;
  }

  return "***";
}
