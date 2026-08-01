import { z } from "zod";

/** An opaque, hex-encoded token as generated for the pending email
 * change (see `service/user-profile.service.ts`'s `requestEmailChange`)
 * — validated only for shape here; whether it's actually valid (exists,
 * unexpired, unused) is a service-layer, database-backed check. */
export const confirmEmailChangeSchema = z.object({
  token: z.string().min(1, "Token is required"),
});
