/**
 * Mirrors apps/api's `UserResponseDto` exactly
 * (apps/api/src/modules/user/dto/user-response.dto.ts) — the shape every
 * auth endpoint (`register`, `login`, `refresh`, `me`) returns as `user`.
 * Dates arrive as ISO strings over JSON, not `Date` instances. `roles` is
 * a flat string array (role slugs like "member") — the closed role
 * vocabulary lives in apps/api's RBAC module and isn't exposed to the
 * frontend, so this stays `string[]` rather than a guessed union.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthenticatedUser;
}

/** Mirrors apps/api's `LoginDto` (email + password only — no remember-me
 * or other fields exist on the real endpoint). */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Mirrors apps/api's `RegisterDto`. */
export interface RegisterRequest {
  email: string;
  password: string;
}
