/** The generic action vocabulary `permissions/`'s mapping is built
 * from — shared across every management module rather than each module
 * inventing its own verbs. `APPROVE`/`REJECT` exist specifically for
 * Review Moderation; `EXPORT` for Reports. */
export const ADMIN_ACTIONS = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  APPROVE: "approve",
  REJECT: "reject",
  EXPORT: "export",
} as const;

export type AdminAction = (typeof ADMIN_ACTIONS)[keyof typeof ADMIN_ACTIONS];
