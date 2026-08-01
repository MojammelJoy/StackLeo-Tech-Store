import { prisma } from "../../../database";

import type { UpsertUserPreferencesInput, UserPreferences } from "../types";
import type { UserPreferencesRepository } from "./user-preferences.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `UserPreferencesRepository`. Defaults
 * to the shared `prisma` client from `database/` (never constructs its
 * own connection), matching every other module's Prisma repository.
 */
export class UserPreferencesPrismaRepository implements UserPreferencesRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    return this.prismaClient.userPreferences.findUnique({ where: { userId } });
  }

  async upsert(userId: string, data: UpsertUserPreferencesInput): Promise<UserPreferences> {
    return this.prismaClient.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        locale: data.locale,
        timezone: data.timezone,
        currency: data.currency,
        theme: data.theme,
        marketingEmailsOptIn: data.marketingEmailsOptIn,
        orderUpdatesOptIn: data.orderUpdatesOptIn,
      },
      update: {
        locale: data.locale,
        timezone: data.timezone,
        currency: data.currency,
        theme: data.theme,
        marketingEmailsOptIn: data.marketingEmailsOptIn,
        orderUpdatesOptIn: data.orderUpdatesOptIn,
      },
    });
  }
}
