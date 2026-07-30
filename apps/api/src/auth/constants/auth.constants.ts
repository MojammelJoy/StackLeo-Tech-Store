/**
 * bcrypt cost factor. 10 is the library's own recommended default —
 * high enough to resist brute-forcing, low enough not to make every
 * login/registration request noticeably slow.
 */
export const BCRYPT_SALT_ROUNDS = 10;

/**
 * Single algorithm used for every token this module signs and verifies.
 * Passed explicitly to both `jwt.sign` and `jwt.verify` (as an allow-list)
 * rather than left to the library's default, to close off JWT
 * "algorithm confusion" attacks.
 */
export const JWT_ALGORITHM = "HS256";

export const AUTH_HEADER_NAME = "authorization";
export const BEARER_PREFIX = "Bearer ";

/**
 * Cookie names for browser clients. Not secrets — safe to be constants
 * rather than environment configuration.
 */
export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;
