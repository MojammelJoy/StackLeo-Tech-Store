import { z } from "zod";

import { ROLES } from "../../rbac";

/** An explicit whitelist of `modules/rbac`'s own role vocabulary —
 * never a bare string — so a client can never assign a role that
 * doesn't exist (or a typo that would silently grant no permissions at
 * all). At least one role is always required: a user with `roles: []`
 * would be unable to do anything, including have this undone, since
 * `RBAC_MANAGE` itself requires a role. */
export const updateUserRolesSchema = z.object({
  roles: z.array(z.enum([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MEMBER])).min(1),
});
