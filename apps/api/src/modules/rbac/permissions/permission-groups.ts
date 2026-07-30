import { PERMISSIONS } from "../constants";

import type { PermissionGroupMap } from "../types";

/**
 * Logical groupings of related permissions — for presenting/assigning
 * permissions together (e.g. a future admin UI checkbox group) rather
 * than one at a time. Purely descriptive: nothing in this module reads
 * these groups for authorization decisions, only individual permissions
 * (via `ROLE_PERMISSIONS`) do.
 */
export const PERMISSION_GROUPS: PermissionGroupMap = {
  USER_MANAGEMENT: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
  ],
  RBAC_MANAGEMENT: [PERMISSIONS.RBAC_MANAGE],
};
