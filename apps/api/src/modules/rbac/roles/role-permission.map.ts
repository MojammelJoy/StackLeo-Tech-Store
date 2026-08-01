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
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.CATEGORY_READ,
    PERMISSIONS.CATEGORY_CREATE,
    PERMISSIONS.CATEGORY_UPDATE,
    PERMISSIONS.CATEGORY_DELETE,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.CATEGORY_READ,
    PERMISSIONS.CATEGORY_CREATE,
    PERMISSIONS.CATEGORY_UPDATE,
    PERMISSIONS.CATEGORY_DELETE,
  ],
  // `PRODUCT_READ`/`CATEGORY_READ` are deliberately absent here: each
  // gates seeing its module's non-`ACTIVE`/non-`PUBLIC`/soft-deleted
  // rows (see `ProductService.canBypassVisibilityScope` and
  // `CategoryService.canBypassVisibilityScope`), a staff-only
  // capability. A member's catalog visibility is otherwise identical to
  // an anonymous visitor's — browsing the public catalog needs no
  // permission at all.
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
