/** Which moderation strategy screened a review — see `moderation/`. */
export const MODERATION_STRATEGIES = {
  AUTOMATED: "automated",
  MANUAL: "manual",
} as const;

export type ModerationStrategyName =
  (typeof MODERATION_STRATEGIES)[keyof typeof MODERATION_STRATEGIES];
