import type {
  CreateEmailVerificationTokenInput,
  CreatePasswordResetTokenInput,
  CreateRefreshTokenInput,
  EmailVerificationTokenRecord,
  PasswordResetTokenRecord,
  RefreshTokenRecord,
} from "../types";

/**
 * Persistence contract for everything `modules/auth` owns directly:
 * refresh tokens (sessions), email verification tokens, and password
 * reset tokens. User persistence itself is `modules/user`'s
 * `UserRepository` — this module depends on that interface rather than
 * duplicating user storage, since registering/authenticating a user is
 * fundamentally operating on the same account record, not a separate
 * bounded context the way sibling domain modules (orders, payments,
 * ...) are kept apart from each other.
 */
export interface AuthRepository {
  createRefreshToken(data: CreateRefreshTokenInput): Promise<RefreshTokenRecord>;
  findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  findRefreshTokenById(id: string): Promise<RefreshTokenRecord | null>;
  findActiveSessionsByUserId(userId: string): Promise<RefreshTokenRecord[]>;
  markRefreshTokenRotated(id: string, replacedById: string): Promise<void>;
  revokeRefreshTokenById(id: string): Promise<void>;
  revokeAllRefreshTokensForUser(userId: string, exceptId?: string): Promise<void>;

  createEmailVerificationToken(
    data: CreateEmailVerificationTokenInput,
  ): Promise<EmailVerificationTokenRecord>;
  findEmailVerificationTokenByHash(tokenHash: string): Promise<EmailVerificationTokenRecord | null>;
  markEmailVerificationTokenUsed(id: string): Promise<void>;

  createPasswordResetToken(data: CreatePasswordResetTokenInput): Promise<PasswordResetTokenRecord>;
  findPasswordResetTokenByHash(tokenHash: string): Promise<PasswordResetTokenRecord | null>;
  markPasswordResetTokenUsed(id: string): Promise<void>;
}
