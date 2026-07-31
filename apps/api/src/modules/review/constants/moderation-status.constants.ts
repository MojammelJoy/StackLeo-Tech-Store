/**
 * A review's moderation lifecycle. `FLAGGED` is distinct from `PENDING`
 * — it means a previously-visible (likely `APPROVED`) review was
 * reported (see `interfaces/abuse-report.interface.ts`) and needs
 * re-review, whereas `PENDING` means it has never been reviewed at all.
 */
export const MODERATION_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  FLAGGED: "flagged",
} as const;

export type ModerationStatus = (typeof MODERATION_STATUSES)[keyof typeof MODERATION_STATUSES];
