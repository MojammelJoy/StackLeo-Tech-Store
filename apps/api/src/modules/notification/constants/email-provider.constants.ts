/** Which concrete email gateway sent a given email notification — see
 * `providers/`. */
export const EMAIL_PROVIDERS = {
  RESEND: "resend",
  SENDGRID: "sendgrid",
} as const;

export type EmailProviderName = (typeof EMAIL_PROVIDERS)[keyof typeof EMAIL_PROVIDERS];
