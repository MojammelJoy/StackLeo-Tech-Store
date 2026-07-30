import { z } from "zod";

import { config } from "../../../config";
import { BRAND_URL_MAX_LENGTH } from "../constants";

/**
 * Reusable URL validation shared by `logoUrl` and `websiteUrl` in both
 * `validation/create-brand.schema.ts` and `update-brand.schema.ts`.
 * Requires HTTPS in production — the same prod-vs-dev split
 * `database/prisma/client.ts` and `modules/rbac`'s middleware already use
 * elsewhere in this app — while still allowing plain `http://` in
 * development/test so a locally-run asset server works without a
 * certificate.
 */
export const brandUrlSchema = z
  .string()
  .max(BRAND_URL_MAX_LENGTH)
  .url()
  .refine((url) => !config.isProduction || url.startsWith("https://"), {
    message: "URL must use HTTPS in production",
  });
