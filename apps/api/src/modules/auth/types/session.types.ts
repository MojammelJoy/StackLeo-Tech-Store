/**
 * A single issued refresh token — effectively a session/device. Matches
 * the `RefreshToken` Prisma model. `tokenHash` never leaves the
 * repository layer; nothing above it should ever serialize this type
 * directly to a client (see `mapper/auth.mapper.ts`).
 */
export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  replacedById: string | null;
  revokedAt: Date | null;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}
