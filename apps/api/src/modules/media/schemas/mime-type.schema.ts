import { z } from "zod";

/** Basic `type/subtype` shape check — the allow-list check (is this MIME
 * type acceptable for this specific purpose) happens separately in
 * `validation/create-media-asset.schema.ts`. */
export const mimeTypeSchema = z
  .string()
  .regex(/^[a-z]+\/[a-z0-9.+-]+$/, "Must be a valid MIME type, e.g. image/png");
