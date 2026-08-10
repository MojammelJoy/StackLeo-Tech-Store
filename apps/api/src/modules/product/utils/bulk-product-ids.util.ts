import { BadRequestError } from "../../../errors";
import { PRODUCT_BULK_LOOKUP_MAX_IDS } from "../constants";

const BULK_IDS_SEPARATOR = ",";

/**
 * Parses `?ids=a,b,c` (already guaranteed present and non-empty by
 * `validation/bulk-product-query.schema.ts`) into a validated array of
 * non-empty product ids. Not expressed as a zod `.transform()` on the
 * query schema — see that schema's doc comment for why — so this runs
 * as a plain function in the controller instead, throwing the same
 * `BadRequestError` every other hand-checked input in this module does
 * (e.g. `controller/product.controller.ts`'s `requireParam`), landing on
 * the same global error envelope as a zod validation failure.
 *
 * Rejects: any empty entry (e.g. a stray comma), and more ids than
 * `PRODUCT_BULK_LOOKUP_MAX_IDS` — checked on the raw split count, before
 * de-duplication (which `ProductService.listByIds` handles), so a
 * request can't dodge the limit by repeating one id many times.
 */
export function parseBulkProductIds(raw: string): string[] {
  const ids = raw.split(BULK_IDS_SEPARATOR).map((id) => id.trim());

  if (ids.some((id) => id.length === 0)) {
    throw new BadRequestError("Product ids must not contain empty values");
  }
  if (ids.length > PRODUCT_BULK_LOOKUP_MAX_IDS) {
    throw new BadRequestError(
      `Cannot request more than ${PRODUCT_BULK_LOOKUP_MAX_IDS} product ids at once`,
    );
  }

  return ids;
}
