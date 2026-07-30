import { signAccessToken } from "../utils/access-token.utils";
import { signRefreshToken } from "../utils/refresh-token.utils";
import { verifyAccessToken, verifyRefreshToken } from "../utils/token-verification.utils";

import type { AccessTokenClaims, TokenPair } from "../types";

/**
 * Public entry point for every token operation the rest of the app
 * should use — `utils/` holds the raw `jsonwebtoken` calls, this
 * composes them into the operations callers actually need (middleware
 * now; login/refresh business logic later). Nothing here touches a
 * database — issuing tokens only requires claims the caller already has.
 */
export function issueTokenPair(claims: AccessTokenClaims): TokenPair {
  return {
    accessToken: signAccessToken(claims),
    refreshToken: signRefreshToken({ sub: claims.sub }),
  };
}

/**
 * Issues a fresh access token alone, for the token-refresh flow: a valid
 * refresh token proves who the caller is, but exchanging it shouldn't
 * silently extend the refresh token's own lifetime.
 */
export function issueAccessToken(claims: AccessTokenClaims): string {
  return signAccessToken(claims);
}

export { verifyAccessToken, verifyRefreshToken };
