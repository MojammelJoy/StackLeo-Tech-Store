import { AUTH_HEADER_NAME, BEARER_PREFIX } from "../constants";

import { getAccessTokenCookie } from "./cookie.utils";

import type { Request } from "express";

/**
 * Resolves the access token for an incoming request. Checks the
 * `Authorization: Bearer <token>` header first — the primary contract
 * for API clients — falling back to the access-token cookie so browser
 * clients work through the exact same middleware.
 */
export function extractAccessToken(req: Request): string | undefined {
  const header = req.header(AUTH_HEADER_NAME);
  if (header?.startsWith(BEARER_PREFIX)) {
    return header.slice(BEARER_PREFIX.length).trim();
  }

  return getAccessTokenCookie(req);
}
