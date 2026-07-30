import { hasAllPermissions, hasAnyPermission } from "../permissions";

import { getEffectivePermissions } from "./effective-permissions.utils";

import type { AuthenticatedUser } from "../../../auth";
import type { Permission } from "../constants";

/**
 * Convenience checks against a full `AuthenticatedUser` (the shape
 * `auth/`'s `authenticate`/`extractCurrentUser` middleware attaches to
 * `req.user`), for callers that don't want to manually resolve effective
 * permissions themselves before checking them.
 */
export function userHasPermission(user: AuthenticatedUser, permission: Permission): boolean {
  return hasAnyPermission(getEffectivePermissions(user.roles), permission);
}

export function userHasAnyPermission(
  user: AuthenticatedUser,
  ...permissions: Permission[]
): boolean {
  return hasAnyPermission(getEffectivePermissions(user.roles), ...permissions);
}

export function userHasAllPermissions(
  user: AuthenticatedUser,
  ...permissions: Permission[]
): boolean {
  return hasAllPermissions(getEffectivePermissions(user.roles), ...permissions);
}
