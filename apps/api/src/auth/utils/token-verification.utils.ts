import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { z, type ZodSchema } from "zod";

import { config } from "../../config";
import { UnauthorizedError } from "../../errors";
import { JWT_ALGORITHM } from "../constants";

import type { AccessTokenPayload, RefreshTokenPayload } from "../types";

const accessTokenPayloadSchema = z.object({
  sub: z.string(),
  roles: z.array(z.string()),
  type: z.literal("access"),
  iat: z.number(),
  exp: z.number(),
});

const refreshTokenPayloadSchema = z.object({
  sub: z.string(),
  type: z.literal("refresh"),
  jti: z.string(),
  iat: z.number(),
  exp: z.number(),
});

/**
 * Verifies an access token's signature and expiry, then validates the
 * decoded claims against a schema rather than trusting jsonwebtoken's
 * loosely-typed `JwtPayload` — a validly-signed token whose shape
 * doesn't match should never reach a caller expecting `AccessTokenPayload`.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return verifyAndValidate(token, config.auth.jwt.accessSecret, accessTokenPayloadSchema);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return verifyAndValidate(token, config.auth.jwt.refreshSecret, refreshTokenPayloadSchema);
}

function verifyAndValidate<T>(token: string, secret: string, schema: ZodSchema<T>): T {
  try {
    const decoded = jwt.verify(token, secret, { algorithms: [JWT_ALGORITHM] });
    return schema.parse(decoded);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError("Token has expired");
    }
    if (error instanceof JsonWebTokenError || error instanceof z.ZodError) {
      throw new UnauthorizedError("Invalid token");
    }
    throw error;
  }
}
