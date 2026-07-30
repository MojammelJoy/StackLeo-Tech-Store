import { getRolePermissions } from "../roles";

import type { Permission } from "../constants";

/**
 * Resolves a user's full, deduplicated permission set from their roles
 * via the static role → permission map. The one place that should ever
 * do this resolution — `middleware/` and anything else that needs "what
 * can this user actually do" calls this rather than re-deriving it from
 * `ROLE_PERMISSIONS` directly.
 */
export function getEffectivePermissions(userRoles: readonly string[]): Permission[] {
  const permissions = new Set<Permission>();

  for (const role of userRoles) {
    for (const permission of getRolePermissions(role)) {
      permissions.add(permission);
    }
  }

  return Array.from(permissions);
}
