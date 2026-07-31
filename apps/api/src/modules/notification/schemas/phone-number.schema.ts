import { z } from "zod";

/** A loose E.164-shaped check — a flat pattern with no nested
 * quantifiers, so it never trips `security/detect-unsafe-regex`. */
export const phoneNumberSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number");
