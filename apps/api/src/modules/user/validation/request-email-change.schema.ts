import { z } from "zod";

/** Trims/lower-cases before the format check, mirroring
 * `modules/auth`'s `emailSchema` (duplicated rather than imported —
 * `modules/user` and `modules/auth` already depend on each other at the
 * service layer; pulling a validation primitive across that same edge
 * would only add an import-order hazard for a one-line rule). Requires
 * the current password, same as `modules/auth`'s `changePasswordSchema`
 * — changing the account's email is as sensitive as changing its
 * password, so it gets the same re-authentication requirement. */
export const requestEmailChangeSchema = z.object({
  newEmail: z.string().trim().toLowerCase().email("Must be a valid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
});
