import { BadRequestError, UnauthorizedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { Request } from "express";

/** Shared by every controller in this module — mirrors the identical
 * local helper every other module's controller defines, pulled into one
 * place here purely because this module has six controllers that would
 * otherwise repeat it six times (not a deviation from the established
 * per-request-validation pattern, just DRY within this one module). The
 * authenticated admin is always derived from `req.user` (populated by
 * `auth/`'s `authenticate` middleware from a verified JWT) — never from
 * any client-supplied field, so a request body can never spoof "who is
 * making this change". */
export function requireAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  return req.user;
}

export function requireParam(req: Request, key: string): string {
  const value = req.params[key];
  if (!value) {
    throw new BadRequestError(`"${key}" parameter is required`);
  }
  return value;
}
