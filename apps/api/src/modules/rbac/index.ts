/**
 * Reusable authorization infrastructure: the role/permission vocabulary,
 * the static role → permission mapping, and the role/permission checking
 * utilities + middleware built on top of them. No controllers, routes,
 * services, or business logic live here — this is what those depend on
 * once they exist, alongside `auth/`'s authentication layer.
 */
export { PERMISSIONS, ROLES } from "./constants";
export type { Permission, Role } from "./constants";

export { requirePermission, requireRole } from "./middleware";

export {
  PERMISSION_GROUPS,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "./permissions";

export { ROLE_PERMISSIONS, getRolePermissions, hasAllRoles, hasAnyRole, hasRole } from "./roles";

export type { PermissionGroupMap, RolePermissionMap } from "./types";

export {
  getEffectivePermissions,
  userHasAllPermissions,
  userHasAnyPermission,
  userHasPermission,
} from "./utils";
