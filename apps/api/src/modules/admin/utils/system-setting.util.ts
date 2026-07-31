import type { SystemSetting } from "../types";

/** Interprets a setting's plain-string `value` as a boolean, for the
 * common feature-flag-shaped setting (e.g. `"site.maintenance_mode"` ->
 * `"true"`/`"false"`). Anything other than the literal string `"true"`
 * is `false`, never thrown on. */
export function parseBooleanSetting(setting: SystemSetting): boolean {
  return setting.value.trim().toLowerCase() === "true";
}
