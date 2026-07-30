import { ForbiddenError, UnauthorizedError } from "../../errors";

import type { NextFunction, Request, Response } from "express";

/**
 * Restricts a route to requests whose authenticated user has at least
 * one of the given roles. Must run after `authenticate` (or
 * `extractCurrentUser`) so `req.user` is already populated.
 *
 * Role-ready, not a role system: there is no `Role` enum, no persisted
 * roles, and no business rules about what a valid role is anywhere in
 * this codebase yet. This only compares whatever strings the token's
 * `roles` claim already contains against whatever strings the caller
 * passes in — the actual role vocabulary is defined by whoever calls
 * this once that exists.
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }

    const { roles } = req.user;
    const isAuthorized =
      allowedRoles.length === 0 || allowedRoles.some((role) => roles.includes(role));

    if (!isAuthorized) {
      next(new ForbiddenError("Insufficient permissions"));
      return;
    }

    next();
  };
}
