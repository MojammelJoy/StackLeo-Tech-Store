import { config } from "../../../config";
import { ForbiddenError, UnauthorizedError } from "../../../errors";
import { hasAnyRole } from "../roles";

import type { Role } from "../constants";
import type { NextFunction, Request, Response } from "express";

/**
 * Restricts a route to requests whose authenticated user has at least
 * one of the given roles, typed against the concrete `Role` union
 * instead of bare strings — the RBAC-aware counterpart to `auth/`'s
 * generic `authorize`. Must run after `authenticate`/`extractCurrentUser`
 * so `req.user` is already populated.
 *
 * Error `details` are only attached outside production — the same
 * prod-vs-dev split `database/prisma/client.ts` and `logger/` already
 * use elsewhere in this app — so a denied request never reveals its
 * expected roles to a caller in production.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }

    const isAuthorized = roles.length === 0 || hasAnyRole(req.user.roles, ...roles);

    if (!isAuthorized) {
      next(
        new ForbiddenError(
          "Insufficient role",
          config.isProduction ? undefined : { requiredRoles: roles, actualRoles: req.user.roles },
        ),
      );
      return;
    }

    next();
  };
}
