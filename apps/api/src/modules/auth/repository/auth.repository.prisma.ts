import { prisma } from "../../../database";

import type {
  CreateEmailVerificationTokenInput,
  CreatePasswordResetTokenInput,
  CreateRefreshTokenInput,
  EmailVerificationTokenRecord,
  PasswordResetTokenRecord,
  RefreshTokenRecord,
} from "../types";
import type { AuthRepository } from "./auth.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `AuthRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class AuthPrismaRepository implements AuthRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async createRefreshToken(data: CreateRefreshTokenInput): Promise<RefreshTokenRecord> {
    return this.prismaClient.refreshToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
  }

  async findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    return this.prismaClient.refreshToken.findUnique({ where: { tokenHash } });
  }

  async findRefreshTokenById(id: string): Promise<RefreshTokenRecord | null> {
    return this.prismaClient.refreshToken.findUnique({ where: { id } });
  }

  async findActiveSessionsByUserId(userId: string): Promise<RefreshTokenRecord[]> {
    return this.prismaClient.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
  }

  async markRefreshTokenRotated(id: string, replacedById: string): Promise<void> {
    await this.prismaClient.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), replacedById },
    });
  }

  async revokeRefreshTokenById(id: string): Promise<void> {
    await this.prismaClient.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllRefreshTokensForUser(userId: string, exceptId?: string): Promise<void> {
    await this.prismaClient.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      data: { revokedAt: new Date() },
    });
  }

  async createEmailVerificationToken(
    data: CreateEmailVerificationTokenInput,
  ): Promise<EmailVerificationTokenRecord> {
    return this.prismaClient.emailVerificationToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findEmailVerificationTokenByHash(
    tokenHash: string,
  ): Promise<EmailVerificationTokenRecord | null> {
    return this.prismaClient.emailVerificationToken.findUnique({ where: { tokenHash } });
  }

  async markEmailVerificationTokenUsed(id: string): Promise<void> {
    await this.prismaClient.emailVerificationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async createPasswordResetToken(
    data: CreatePasswordResetTokenInput,
  ): Promise<PasswordResetTokenRecord> {
    return this.prismaClient.passwordResetToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findPasswordResetTokenByHash(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
    return this.prismaClient.passwordResetToken.findUnique({ where: { tokenHash } });
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await this.prismaClient.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}
