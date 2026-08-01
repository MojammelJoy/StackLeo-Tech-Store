import type { User, UserProfile } from "../types";

/**
 * What `GET /users/:id` returns for anyone viewing someone else's
 * profile — deliberately excludes `email`, `roles`, activity/
 * verification flags, and every other account-security field, and is
 * only ever built once the caller has already been confirmed to be
 * allowed to see it (target is active and `UserProfile.isPublic`); see
 * `service/user-profile.service.ts`'s `getPublicProfile`.
 */
export interface PublicUserProfileDto {
  id: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}

export function toPublicUserProfileDto(user: User, profile: UserProfile): PublicUserProfileDto {
  return {
    id: user.id,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    createdAt: user.createdAt,
  };
}
