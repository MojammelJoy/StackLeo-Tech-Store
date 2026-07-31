import type { AdminAction, ManagementModuleKey } from "../constants";

/**
 * Which permission key (see `permission-key.util.ts`'s
 * `buildPermissionKey`) guards each action within one management
 * module. Deliberately a bare string per action, not an actual
 * `modules/rbac` `Permission` object — this module never imports
 * `modules/rbac`, the same cross-module decoupling every foundation in
 * this app follows. A real implementation would resolve these strings
 * against whatever `modules/rbac` currently has configured.
 */
export interface ManagementModulePermissionMap {
  module: ManagementModuleKey;
  actions: Partial<Record<AdminAction, string>>;
}
