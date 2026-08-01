import type { CreateEmailChangeTokenInput, EmailChangeTokenRecord } from "../types";

/**
 * Persistence contract for `EmailChangeToken` — this module's own
 * hashed-opaque-token table for the change-email workflow, kept
 * separate from `modules/auth`'s `EmailVerificationToken` (see the
 * model's doc comment in `prisma/schema.prisma`).
 */
export interface EmailChangeRepository {
  create(data: CreateEmailChangeTokenInput): Promise<EmailChangeTokenRecord>;
  findByTokenHash(tokenHash: string): Promise<EmailChangeTokenRecord | null>;
  markUsed(id: string): Promise<void>;
  /** Marks every still-usable token for this user as used, without
   * consuming them for their original purpose — called before issuing a
   * new email-change token, so requesting a second change immediately
   * invalidates a still-pending first one instead of leaving two valid
   * tokens outstanding. */
  invalidateAllForUser(userId: string): Promise<void>;
}
