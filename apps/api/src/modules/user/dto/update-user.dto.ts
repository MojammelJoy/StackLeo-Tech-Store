import { z } from "zod";

/**
 * Deliberately excludes password: rotating a password is a distinct,
 * higher-stakes operation (verifying the current password, invalidating
 * existing sessions, etc.) that belongs to its own DTO once that flow is
 * built, not a field on a general-purpose profile update.
 */
export const updateUserSchema = z
  .object({
    email: z.string().email(),
    isActive: z.boolean(),
  })
  .partial();

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
