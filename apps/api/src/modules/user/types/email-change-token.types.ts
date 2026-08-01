/**
 * A single-use, short-lived, hashed token authorizing a pending change
 * of `User.email` to `newEmail` — matches the `EmailChangeToken` model
 * in `prisma/schema.prisma`. Never stores the raw token, mirroring the
 * pattern `modules/auth` established for its own tokens.
 */
export interface EmailChangeTokenRecord {
  id: string;
  userId: string;
  newEmail: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface CreateEmailChangeTokenInput {
  userId: string;
  newEmail: string;
  tokenHash: string;
  expiresAt: Date;
}
