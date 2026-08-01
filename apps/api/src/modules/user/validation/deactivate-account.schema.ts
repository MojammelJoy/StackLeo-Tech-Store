import { z } from "zod";

/** Requires the current password before deactivating the account —
 * the same re-authentication bar as changing the password or email, for
 * an action that's just as consequential. */
export const deactivateAccountSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
});
