import { verifyAccessToken } from "../services";
import { extractAccessToken } from "../utils";

import type { NextFunction, Request, Response } from "express";

/**
 * Attaches `req.user` when a valid access token is present, but never
 * rejects the request when it's missing or invalid — for routes that
 * behave differently for authenticated vs. anonymous callers without
 * requiring a session. Use `authenticate` instead when a route must
 * reject unauthenticated requests outright.
 */
export function extractCurrentUser(req: Request, _res: Response, next: NextFunction): void {
  const token = extractAccessToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, roles: payload.roles };
  } catch {
    // Invalid/expired token on a soft-auth route: proceed as anonymous
    // rather than rejecting, consistent with this middleware's contract.
  }

  next();
}
