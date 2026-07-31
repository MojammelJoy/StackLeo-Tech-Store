import type { ManagementModuleKey } from "../constants";

/** The human-readable description of one `ManagementModuleKey` — what
 * `utils/management-module-catalog.util.ts`'s `getManagementModuleCatalog()`
 * returns one of, per module. */
export interface ManagementModuleDescriptor {
  key: ManagementModuleKey;
  label: string;
  description: string;
}
