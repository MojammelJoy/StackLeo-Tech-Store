import { randomUUID } from "node:crypto";

import jwt, { type SignOptions } from "jsonwebtoken";

import { config } from "../../config";
import { JWT_ALGORITHM } from "../constants";

import type { RefreshTokenClaims } from "../types";

/**
 * Signs a long-lived refresh token. Carries `sub` plus a fresh, random
 * `jti` — a refresh token's only job is to prove who the caller is when
 * exchanging it for a new access token, so it needs no `roles` claim,
 * but `jti` guarantees this signature is unique even if issued for the
 * same subject within the same second as another (see
 * `RefreshTokenPayload.jti`'s comment for why that matters).
 */
export function signRefreshToken(claims: RefreshTokenClaims): string {
  const options: SignOptions = {
    algorithm: JWT_ALGORITHM,
    expiresIn: config.auth.jwt.refreshExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(
    { ...claims, type: "refresh", jti: randomUUID() },
    config.auth.jwt.refreshSecret,
    options,
  );
}
