import { prisma } from "../../../database";

import type { CreateEmailChangeTokenInput, EmailChangeTokenRecord } from "../types";
import type { EmailChangeRepository } from "./email-change.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `EmailChangeRepository`. Defaults to
 * the shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class EmailChangePrismaRepository implements EmailChangeRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async create(data: CreateEmailChangeTokenInput): Promise<EmailChangeTokenRecord> {
    return this.prismaClient.emailChangeToken.create({
      data: {
        userId: data.userId,
        newEmail: data.newEmail,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<EmailChangeTokenRecord | null> {
    return this.prismaClient.emailChangeToken.findUnique({ where: { tokenHash } });
  }

  async markUsed(id: string): Promise<void> {
    await this.prismaClient.emailChangeToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async invalidateAllForUser(userId: string): Promise<void> {
    await this.prismaClient.emailChangeToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  }
}
