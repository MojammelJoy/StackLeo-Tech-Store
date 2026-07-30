import type { Permission } from "../constants";

/**
 * Pure permission-checking predicates. Operate on a plain permission
 * array — a caller's *resolved* permission set — not on
 * `AuthenticatedUser` or roles; `utils/getEffectivePermissions` is what
 * turns a user's roles into that set, keeping this file decoupled from
 * both `roles/` and `auth/`.
 */
export function hasPermission(
  userPermissions: readonly Permission[],
  permission: Permission,
): boolean {
  return userPermissions.includes(permission);
}

export function hasAnyPermission(
  userPermissions: readonly Permission[],
  ...permissions: Permission[]
): boolean {
  return permissions.some((permission) => userPermissions.includes(permission));
}

export function hasAllPermissions(
  userPermissions: readonly Permission[],
  ...permissions: Permission[]
): boolean {
  return permissions.every((permission) => userPermissions.includes(permission));
}
