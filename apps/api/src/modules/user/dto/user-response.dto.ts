import type { User } from "../types";

/**
 * The public-facing shape of a User — every field a caller outside this
 * module is allowed to see. Excludes `passwordHash` unconditionally, so
 * a future controller can never leak it by serializing the domain
 * entity directly instead of going through this mapper.
 */
export interface UserResponseDto {
  id: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    roles: user.roles,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
