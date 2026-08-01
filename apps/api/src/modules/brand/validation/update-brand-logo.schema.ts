import { z } from "zod";

import { BRAND_LOGO_ALT_TEXT_MAX_LENGTH } from "../constants";
import { brandUrlSchema } from "../schemas";

/** Only the already-uploaded asset's URL is accepted here — no file
 * storage/upload infrastructure exists yet (out of scope for this API),
 * so this endpoint stores logo *metadata* only, mirroring the User
 * API's avatar-metadata endpoint. `logoUrl: null` clears the logo. */
export const updateBrandLogoSchema = z.object({
  logoUrl: brandUrlSchema.nullable(),
  logoAltText: z.string().trim().max(BRAND_LOGO_ALT_TEXT_MAX_LENGTH).nullable().optional(),
});
