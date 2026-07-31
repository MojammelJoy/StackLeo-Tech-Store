import { z } from "zod";

import { config } from "../../../config";
import { descriptionSchema, systemSettingKeySchema, systemSettingValueSchema } from "../schemas";

/**
 * `description` is required in production — undocumented configuration
 * is a real liability once other admins depend on it, the same
 * prod-vs-dev discipline `modules/coupon`'s create schema applies to
 * `expiresAt`. Outside production, a quick throwaway setting doesn't
 * need one.
 */
export const createSystemSettingSchema = z
  .object({
    key: systemSettingKeySchema,
    value: systemSettingValueSchema,
    description: descriptionSchema.optional(),
  })
  .refine((data) => !config.isProduction || (data.description?.trim().length ?? 0) > 0, {
    message: "description is required for system settings created in production",
    path: ["description"],
  });
