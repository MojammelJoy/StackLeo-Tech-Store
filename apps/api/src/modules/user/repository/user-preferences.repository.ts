import type { UpsertUserPreferencesInput, UserPreferences } from "../types";

/**
 * Persistence contract for `UserPreferences`. Like
 * `UserProfileRepository`, `upsert` creates a default row on first
 * write, so a user always has a resolvable set of preferences without
 * a separate "initialize on register" step.
 */
export interface UserPreferencesRepository {
  findByUserId(userId: string): Promise<UserPreferences | null>;
  upsert(userId: string, data: UpsertUserPreferencesInput): Promise<UserPreferences>;
}
