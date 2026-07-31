import { z } from "zod";

import { USER_PASSWORD_MAX_LENGTH, USER_PASSWORD_MIN_LENGTH } from "../../user";

/** Reuses `modules/user`'s own length bounds rather than redefining
 * them — one password policy, not two that can drift apart. */
export const passwordSchema = z
  .string()
  .min(USER_PASSWORD_MIN_LENGTH, `Password must be at least ${USER_PASSWORD_MIN_LENGTH} characters`)
  .max(USER_PASSWORD_MAX_LENGTH, `Password must be at most ${USER_PASSWORD_MAX_LENGTH} characters`);
