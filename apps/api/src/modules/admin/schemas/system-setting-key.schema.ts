import { z } from "zod";

import { SYSTEM_SETTING_KEY_MAX_LENGTH } from "../constants";

/** Lowercase, dot/underscore-separated keys (e.g. `"site.maintenance_mode"`)
 * — a flat character class, not a nested-quantifier shape, so it never
 * trips `security/detect-unsafe-regex`. */
export const systemSettingKeySchema = z
  .string()
  .min(1)
  .max(SYSTEM_SETTING_KEY_MAX_LENGTH)
  .regex(/^[a-z0-9_.]+$/, "Setting key must be lowercase letters, digits, '.' and '_' only");
