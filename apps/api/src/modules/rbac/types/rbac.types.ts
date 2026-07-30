import type { Permission } from "../constants";

/**
 * Shape of the role → permission mapping (`roles/role-permission.map`).
 * Keyed by plain `string` rather than `Role` so looking up an
 * unrecognized role (e.g. a stale value from an old token) is a type
 * error to guard against, not a lookup that can't happen — callers go
 * through `getRolePermissions`, which resolves unknown roles to `[]`
 * instead of `undefined`.
 */
export type RolePermissionMap = Record<string, readonly Permission[]>;

/** Shape of a named group of related permissions (`permissions/permission-groups`). */
export type PermissionGroupMap = Record<string, readonly Permission[]>;
