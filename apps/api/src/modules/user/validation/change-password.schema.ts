import { z } from "zod";

import { USER_PASSWORD_MAX_LENGTH, USER_PASSWORD_MIN_LENGTH } from "../constants";

/**
 * Mirrors `modules/auth`'s own `changePasswordSchema` exactly (same
 * `USER_PASSWORD_MIN_LENGTH`/`USER_PASSWORD_MAX_LENGTH` bounds, defined
 * in this module already) rather than importing it: `modules/auth`
 * already takes a real, unavoidable *value*-level dependency on
 * `modules/user` (its own `passwordSchema` imports these same
 * constants; `AuthService` imports `toUserResponseDto`), so this module
 * deliberately never imports a value back — only types (see
 * `service/user-profile.service.ts`) — which keeps the dependency
 * one-directional and avoids a real module-load cycle between the two
 * (confirmed the hard way: a bidirectional value import here hangs/
 * throws during app boot in this codebase's ESM module graph).
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(
        USER_PASSWORD_MIN_LENGTH,
        `Password must be at least ${USER_PASSWORD_MIN_LENGTH} characters`,
      )
      .max(
        USER_PASSWORD_MAX_LENGTH,
        `Password must be at most ${USER_PASSWORD_MAX_LENGTH} characters`,
      ),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });
