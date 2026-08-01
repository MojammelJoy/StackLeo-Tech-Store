import { prisma } from "../../../database";

import type { UpsertUserProfileInput, UserProfile } from "../types";
import type { UserProfileRepository } from "./user-profile.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `UserProfileRepository`. Defaults to
 * the shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class UserProfilePrismaRepository implements UserProfileRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findByUserId(userId: string): Promise<UserProfile | null> {
    return this.prismaClient.userProfile.findUnique({ where: { userId } });
  }

  async upsert(userId: string, data: UpsertUserProfileInput): Promise<UserProfile> {
    return this.prismaClient.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: data.displayName ?? null,
        bio: data.bio ?? null,
        phoneNumber: data.phoneNumber ?? null,
        isPublic: data.isPublic ?? true,
      },
      update: {
        displayName: data.displayName,
        bio: data.bio,
        phoneNumber: data.phoneNumber,
        isPublic: data.isPublic,
      },
    });
  }

  async updateAvatar(userId: string, avatarUrl: string | null): Promise<UserProfile> {
    return this.prismaClient.userProfile.upsert({
      where: { userId },
      create: { userId, avatarUrl, avatarUpdatedAt: new Date() },
      update: { avatarUrl, avatarUpdatedAt: new Date() },
    });
  }
}
