import type { UpsertUserProfileInput, UserProfile } from "../types";

/**
 * Persistence contract for `UserProfile`. `upsert`/`updateAvatar` both
 * create a default row on first write, so a caller never has to branch
 * on "does this user already have a profile" — the service layer relies
 * on that to keep `getOwnProfile`/`updateProfile`/`updateAvatar` simple.
 */
export interface UserProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  upsert(userId: string, data: UpsertUserProfileInput): Promise<UserProfile>;
  updateAvatar(userId: string, avatarUrl: string | null): Promise<UserProfile>;
}
