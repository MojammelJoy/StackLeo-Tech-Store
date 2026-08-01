import { z } from "zod";

import {
  USER_BIO_MAX_LENGTH,
  USER_DISPLAY_NAME_MAX_LENGTH,
  USER_PHONE_NUMBER_MAX_LENGTH,
} from "../constants";

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name cannot be empty")
    .max(USER_DISPLAY_NAME_MAX_LENGTH)
    .nullable()
    .optional(),
  bio: z.string().trim().max(USER_BIO_MAX_LENGTH).nullable().optional(),
  phoneNumber: z.string().trim().max(USER_PHONE_NUMBER_MAX_LENGTH).nullable().optional(),
  isPublic: z.boolean().optional(),
});
