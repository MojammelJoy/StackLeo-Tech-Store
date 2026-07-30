import { config } from "../../../config";
import { ForbiddenError, UnauthorizedError } from "../../../errors";
import { userHasAnyPermission } from "../utils";

import type { Permission } from "../constants";
import type { NextFunction, Request, Response } from "express";

/**
 * Restricts a route to requests whose authenticated user's roles resolve
 * (via `ROLE_PERMISSIONS`) to at least one of the given permissions.
 * Must run after `authenticate`/`extractCurrentUser` so `req.user` is
 * already populated. Prefer this over `requireRole` wherever a route's
 * real requirement is "can do X" rather than "holds role Y" — the two
 * only agree until roles get reshuffled.
 */
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }

    const isAuthorized = permissions.length === 0 || userHasAnyPermission(req.user, ...permissions);

    if (!isAuthorized) {
      next(
        new ForbiddenError(
          "Insufficient permissions",
          config.isProduction ? undefined : { requiredPermissions: permissions },
        ),
      );
      return;
    }

    next();
  };
}
