import type { AdminAction, ManagementModuleKey } from "../constants";

/** The canonical `module:action` string a permission key is built from
 * — a single source of truth so `default-permission-map.ts` and any
 * future caller never format this by hand differently. */
export function buildPermissionKey(module: ManagementModuleKey, action: AdminAction): string {
  return `${module}:${action}`;
}
