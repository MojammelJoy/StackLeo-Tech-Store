/**
 * The persisted profile/contact/visibility fields for a user — matches
 * the `UserProfile` model in `prisma/schema.prisma`. Kept separate from
 * `User` (identity + credentials) so a user can exist without a profile
 * row until one is first read or written (see `UserProfileService`'s
 * `getOwnProfile`, which upserts a default row on first access).
 */
export interface UserProfile {
  id: string;
  userId: string;
  displayName: string | null;
  bio: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  avatarUpdatedAt: Date | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Partial update applied via an upsert — an absent field leaves the
 * existing (or default, on first creation) value untouched. */
export interface UpsertUserProfileInput {
  displayName?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  isPublic?: boolean;
}
