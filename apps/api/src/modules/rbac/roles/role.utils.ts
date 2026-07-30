import type { Role } from "../constants";

/**
 * Pure role-checking predicates. Operate on a plain role-string array —
 * not on `AuthenticatedUser` directly — so they're usable (and testable)
 * outside of an Express request entirely; `middleware/` is the only
 * place that reads `req.user.roles` and passes it in.
 */
export function hasRole(userRoles: readonly string[], role: Role): boolean {
  return userRoles.includes(role);
}

export function hasAnyRole(userRoles: readonly string[], ...roles: Role[]): boolean {
  return roles.some((role) => userRoles.includes(role));
}

export function hasAllRoles(userRoles: readonly string[], ...roles: Role[]): boolean {
  return roles.every((role) => userRoles.includes(role));
}
