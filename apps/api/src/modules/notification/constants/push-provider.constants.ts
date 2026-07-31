/** Which concrete push gateway sent a given push notification — see
 * `providers/`. */
export const PUSH_PROVIDERS = {
  FIREBASE: "firebase",
} as const;

export type PushProviderName = (typeof PUSH_PROVIDERS)[keyof typeof PUSH_PROVIDERS];
