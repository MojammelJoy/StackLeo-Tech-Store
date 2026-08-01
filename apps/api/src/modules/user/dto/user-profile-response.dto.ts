import type { User, UserProfile } from "../types";

/**
 * The full, owner-only view of a user's account + profile — everything
 * `UserResponseDto` exposes, plus the `UserProfile` fields. Never
 * returned for anyone other than the profile's own owner; see
 * `PublicUserProfileDto` for what a non-owner is allowed to see.
 */
export interface UserProfileResponseDto {
  id: string;
  email: string;
  roles: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  displayName: string | null;
  bio: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  avatarUpdatedAt: Date | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toUserProfileResponseDto(user: User, profile: UserProfile): UserProfileResponseDto {
  return {
    id: user.id,
    email: user.email,
    roles: user.roles,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    displayName: profile.displayName,
    bio: profile.bio,
    phoneNumber: profile.phoneNumber,
    avatarUrl: profile.avatarUrl,
    avatarUpdatedAt: profile.avatarUpdatedAt,
    isPublic: profile.isPublic,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
