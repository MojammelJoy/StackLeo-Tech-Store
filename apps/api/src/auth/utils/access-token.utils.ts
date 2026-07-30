import jwt, { type SignOptions } from "jsonwebtoken";

import { config } from "../../config";
import { JWT_ALGORITHM } from "../constants";

import type { AccessTokenClaims } from "../types";

/**
 * Signs a short-lived access token. Kept in its own file from the refresh
 * token so the two can never accidentally share a secret, expiry, or
 * signing options.
 */
export function signAccessToken(claims: AccessTokenClaims): string {
  const options: SignOptions = {
    algorithm: JWT_ALGORITHM,
    // The env value is a human-readable duration ("15m", "7d"); jsonwebtoken's
    // types narrow `expiresIn` to `ms`'s `StringValue` template-literal type,
    // which a validated-but-still-plain `string` can't satisfy structurally.
    expiresIn: config.auth.jwt.accessExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign({ ...claims, type: "access" }, config.auth.jwt.accessSecret, options);
}
