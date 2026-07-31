import { ADMIN_ACTIONS, MANAGEMENT_MODULES } from "../constants";

import { buildPermissionKey } from "./permission-key.util";

import type { AdminAction, ManagementModuleKey } from "../constants";
import type { ManagementModulePermissionMap } from "./permission-mapping.interface";

function crudActions(module: ManagementModuleKey): Partial<Record<AdminAction, string>> {
  return {
    [ADMIN_ACTIONS.VIEW]: buildPermissionKey(module, ADMIN_ACTIONS.VIEW),
    [ADMIN_ACTIONS.CREATE]: buildPermissionKey(module, ADMIN_ACTIONS.CREATE),
    [ADMIN_ACTIONS.UPDATE]: buildPermissionKey(module, ADMIN_ACTIONS.UPDATE),
    [ADMIN_ACTIONS.DELETE]: buildPermissionKey(module, ADMIN_ACTIONS.DELETE),
  };
}

function viewOnly(module: ManagementModuleKey): Partial<Record<AdminAction, string>> {
  return { [ADMIN_ACTIONS.VIEW]: buildPermissionKey(module, ADMIN_ACTIONS.VIEW) };
}

/**
 * The default action-to-permission-key mapping for every management
 * module — static, declarative reference data (the same category as
 * `modules/payment`'s `PAYMENT_METHOD_PROVIDERS` or `modules/media`'s
 * MIME-type tables), not a database query, so it's fully populated here
 * rather than left as a skeleton. A real implementation would use this
 * as the seed a `modules/rbac` role-permission assignment starts from,
 * not as the live source of truth — see `AdminRepository.getPermissionMappings`
 * for where the actual (currently unimplemented) lookup happens.
 */
export const DEFAULT_MANAGEMENT_MODULE_PERMISSIONS: ManagementModulePermissionMap[] = [
  { module: MANAGEMENT_MODULES.DASHBOARD, actions: viewOnly(MANAGEMENT_MODULES.DASHBOARD) },
  { module: MANAGEMENT_MODULES.USER, actions: crudActions(MANAGEMENT_MODULES.USER) },
  { module: MANAGEMENT_MODULES.PRODUCT, actions: crudActions(MANAGEMENT_MODULES.PRODUCT) },
  { module: MANAGEMENT_MODULES.CATEGORY, actions: crudActions(MANAGEMENT_MODULES.CATEGORY) },
  { module: MANAGEMENT_MODULES.BRAND, actions: crudActions(MANAGEMENT_MODULES.BRAND) },
  { module: MANAGEMENT_MODULES.INVENTORY, actions: crudActions(MANAGEMENT_MODULES.INVENTORY) },
  { module: MANAGEMENT_MODULES.ORDER, actions: crudActions(MANAGEMENT_MODULES.ORDER) },
  { module: MANAGEMENT_MODULES.PAYMENT, actions: crudActions(MANAGEMENT_MODULES.PAYMENT) },
  { module: MANAGEMENT_MODULES.COUPON, actions: crudActions(MANAGEMENT_MODULES.COUPON) },
  {
    module: MANAGEMENT_MODULES.REVIEW,
    actions: {
      ...crudActions(MANAGEMENT_MODULES.REVIEW),
      [ADMIN_ACTIONS.APPROVE]: buildPermissionKey(MANAGEMENT_MODULES.REVIEW, ADMIN_ACTIONS.APPROVE),
      [ADMIN_ACTIONS.REJECT]: buildPermissionKey(MANAGEMENT_MODULES.REVIEW, ADMIN_ACTIONS.REJECT),
    },
  },
  {
    module: MANAGEMENT_MODULES.NOTIFICATION,
    actions: crudActions(MANAGEMENT_MODULES.NOTIFICATION),
  },
  {
    module: MANAGEMENT_MODULES.ROLE_PERMISSION,
    actions: crudActions(MANAGEMENT_MODULES.ROLE_PERMISSION),
  },
  {
    module: MANAGEMENT_MODULES.SYSTEM_SETTINGS,
    actions: crudActions(MANAGEMENT_MODULES.SYSTEM_SETTINGS),
  },
  {
    module: MANAGEMENT_MODULES.REPORTS,
    actions: {
      [ADMIN_ACTIONS.VIEW]: buildPermissionKey(MANAGEMENT_MODULES.REPORTS, ADMIN_ACTIONS.VIEW),
      [ADMIN_ACTIONS.EXPORT]: buildPermissionKey(MANAGEMENT_MODULES.REPORTS, ADMIN_ACTIONS.EXPORT),
    },
  },
  { module: MANAGEMENT_MODULES.AUDIT_LOG, actions: viewOnly(MANAGEMENT_MODULES.AUDIT_LOG) },
];
