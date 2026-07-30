import { UnauthorizedError } from "../../errors";
import { verifyAccessToken } from "../services";
import { extractAccessToken } from "../utils";

import type { NextFunction, Request, Response } from "express";

/**
 * Requires a valid access token on the request — via the `Authorization`
 * header or the access-token cookie — and attaches the decoded principal
 * to `req.user`. Rejects with `UnauthorizedError` (handled uniformly by
 * the existing global error middleware) when the token is missing,
 * expired, or invalid. Use `extractCurrentUser` instead for routes that
 * should work for both authenticated and anonymous callers.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractAccessToken(req);
    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, roles: payload.roles };
    next();
  } catch (error) {
    next(error);
  }
}
