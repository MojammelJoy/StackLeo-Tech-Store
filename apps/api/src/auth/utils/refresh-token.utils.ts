import jwt, { type SignOptions } from "jsonwebtoken";

import { config } from "../../config";
import { JWT_ALGORITHM } from "../constants";

import type { RefreshTokenClaims } from "../types";

/**
 * Signs a long-lived refresh token. Deliberately carries only `sub` — a
 * refresh token's only job is to prove who the caller is when exchanging
 * it for a new access token; it is never used for authorization
 * decisions itself, so it needs no `roles` claim.
 */
export function signRefreshToken(claims: RefreshTokenClaims): string {
  const options: SignOptions = {
    algorithm: JWT_ALGORITHM,
    expiresIn: config.auth.jwt.refreshExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign({ ...claims, type: "refresh" }, config.auth.jwt.refreshSecret, options);
}
