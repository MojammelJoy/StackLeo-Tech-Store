import { z } from "zod";

import { USER_LOCALE_MAX_LENGTH, USER_THEME_VALUES, USER_TIMEZONE_MAX_LENGTH } from "../constants";

export const updatePreferencesSchema = z.object({
  locale: z.string().trim().min(2).max(USER_LOCALE_MAX_LENGTH).optional(),
  timezone: z.string().trim().min(1).max(USER_TIMEZONE_MAX_LENGTH).optional(),
  currency: z
    .string()
    .trim()
    .length(3, "Must be a 3-letter ISO currency code")
    .toUpperCase()
    .optional(),
  theme: z.enum(USER_THEME_VALUES).optional(),
  marketingEmailsOptIn: z.boolean().optional(),
  orderUpdatesOptIn: z.boolean().optional(),
});
