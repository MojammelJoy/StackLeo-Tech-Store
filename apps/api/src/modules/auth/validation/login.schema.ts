import { z } from "zod";

import { emailSchema } from "../schemas";

/**
 * Deliberately just `z.string().min(1)` for the password — not
 * `passwordSchema`'s length bounds. Those bounds are a *registration*
 * policy; enforcing them again at login would reject a real, correct
 * password if the policy ever tightens after an account was created.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
