/** What *kind* of notification this is — independent of `channel` (see
 * `notification-channel.constants.ts`): a `SYSTEM` notification can be
 * delivered by email just as easily as a `MARKETING` one. `SYSTEM`
 * covers what the requirements call "system notifications" — ops/
 * account-level notices the platform itself generates, as opposed to
 * `TRANSACTIONAL` (a direct result of something the recipient did, e.g.
 * an order confirmation). */
export const NOTIFICATION_TYPES = {
  TRANSACTIONAL: "transactional",
  MARKETING: "marketing",
  SYSTEM: "system",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
