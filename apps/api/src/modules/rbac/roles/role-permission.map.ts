import { PERMISSIONS, ROLES } from "../constants";

import type { Permission } from "../constants";
import type { RolePermissionMap } from "../types";

/**
 * The static role → permission mapping. `SUPER_ADMIN` lists every
 * permission explicitly rather than deriving it from `PERMISSIONS`
 * automatically — an explicit list is what actually gets audited when a
 * new permission is added, instead of silently inheriting it.
 */
export const ROLE_PERMISSIONS: RolePermissionMap = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.RBAC_MANAGE,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
  ],
  [ROLES.MEMBER]: [PERMISSIONS.USER_READ],
};

/**
 * Resolves a single role's permissions. Returns `[]` for a role absent
 * from the map (e.g. a stale value from an old token) instead of
 * `undefined`, so callers never need an extra guard.
 */
export function getRolePermissions(role: string): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
