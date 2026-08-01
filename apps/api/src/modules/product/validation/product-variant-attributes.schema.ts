import { z } from "zod";

/** A flat string-to-string map, e.g. `{ color: "Red", size: "M" }` — see
 * `types/product-variant.types.ts`'s `ProductVariant.attributes` for why
 * this stays a simple record rather than arbitrary JSON. At least one
 * attribute is required: a variant with none isn't a variation of
 * anything. Shared between create and update so both enforce the exact
 * same shape. */
export const productVariantAttributesSchema = z
  .record(z.string().trim().min(1), z.string().trim().min(1))
  .refine((attributes) => Object.keys(attributes).length > 0, {
    message: "At least one attribute is required",
  });
