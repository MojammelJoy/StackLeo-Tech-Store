/**
 * What a future abuse report against a review would look like — see
 * `ReviewReply`'s comment for why this stays interface-only. A real
 * implementation would likely transition a reported review's
 * `moderationStatus` to `MODERATION_STATUSES.FLAGGED`, but no code here
 * does that.
 */
export interface AbuseReport {
  id: string;
  reviewId: string;
  reportedByUserId: string;
  reason: string;
  reportedAt: Date;
}
