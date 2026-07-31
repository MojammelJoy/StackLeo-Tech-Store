import { z } from "zod";

import { descriptionSchema, systemSettingValueSchema } from "../schemas";

/** Mirrors `UpdateSystemSettingInput`'s narrow field set (see
 * `types/system-setting.types.ts`) — `key` is deliberately absent. */
export const updateSystemSettingSchema = z
  .object({
    value: systemSettingValueSchema,
    description: descriptionSchema.nullable(),
  })
  .partial();
