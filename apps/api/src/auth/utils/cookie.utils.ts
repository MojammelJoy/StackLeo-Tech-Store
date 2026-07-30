import { config } from "../../config";
import { AUTH_COOKIE_NAMES } from "../constants";

import type { TokenPair } from "../types";
import type { CookieOptions, Request, Response } from "express";

/**
 * `secure` only in production so local HTTP development still works;
 * `sameSite: "lax"` blocks cross-site sending on unsafe methods while
 * still allowing normal top-level navigation.
 */
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: "lax",
  path: "/",
};

export function setAuthCookies(res: Response, tokens: TokenPair): void {
  res.cookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, cookieOptions);
  res.cookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, cookieOptions);
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, cookieOptions);
  res.clearCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, cookieOptions);
}

export function getAccessTokenCookie(req: Request): string | undefined {
  return readCookie(req, AUTH_COOKIE_NAMES.ACCESS_TOKEN);
}

export function getRefreshTokenCookie(req: Request): string | undefined {
  return readCookie(req, AUTH_COOKIE_NAMES.REFRESH_TOKEN);
}

function readCookie(req: Request, name: string): string | undefined {
  const cookies: unknown = req.cookies;
  if (typeof cookies !== "object" || cookies === null) return undefined;

  const value: unknown = (cookies as Record<string, unknown>)[name];
  return typeof value === "string" ? value : undefined;
}
