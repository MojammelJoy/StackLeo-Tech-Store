/** Which concrete SMS gateway sent a given SMS notification — see
 * `providers/`. */
export const SMS_PROVIDERS = {
  TWILIO: "twilio",
} as const;

export type SmsProviderName = (typeof SMS_PROVIDERS)[keyof typeof SMS_PROVIDERS];
