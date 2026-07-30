/**
 * Reusable authentication infrastructure: JWT access/refresh tokens,
 * password hashing, cookie helpers, and the authenticate/authorize/
 * current-user middleware built on top of them. No login, registration,
 * refresh endpoint, or user persistence lives here — those depend on a
 * user module that doesn't exist yet; this is the plumbing they'll use
 * once it does.
 */
export {
  AUTH_COOKIE_NAMES,
  AUTH_HEADER_NAME,
  BCRYPT_SALT_ROUNDS,
  BEARER_PREFIX,
  JWT_ALGORITHM,
} from "./constants";

export type {
  AccessTokenClaims,
  AccessTokenPayload,
  AuthenticatedUser,
  JwtTokenType,
  RefreshTokenClaims,
  RefreshTokenPayload,
  TokenPair,
} from "./types";

export {
  clearAuthCookies,
  getAccessTokenCookie,
  getRefreshTokenCookie,
  hashPassword,
  setAuthCookies,
  verifyPassword,
} from "./utils";

export {
  issueAccessToken,
  issueTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
} from "./services";

export { authenticate, authorize, extractCurrentUser } from "./middleware";
