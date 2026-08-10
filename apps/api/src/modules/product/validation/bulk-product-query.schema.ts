import { z } from "zod";

/**
 * Only validates that `ids` is present and non-empty. The CSV itself is
 * split and further validated in `utils/bulk-product-ids.util.ts`'s
 * `parseBulkProductIds`, not here: a `.transform()` on this field would
 * give the schema a different input and output type, which
 * `RequestValidationSchemas`'s `ZodType<TQuery>` constraint
 * (`common/validation/validate-request.middleware.ts`) can't express
 * cleanly for an object field.
 */
export const bulkProductQuerySchema = z.object({
  ids: z
    .string({ required_error: '"ids" query parameter is required' })
    .min(1, '"ids" query parameter is required'),
});
