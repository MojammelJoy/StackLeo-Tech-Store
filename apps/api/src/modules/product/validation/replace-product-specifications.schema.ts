import { z } from "zod";

import { PRODUCT_MAX_SPECIFICATIONS } from "../constants";

import {
  productSpecificationItemSchema,
  uniqueSpecificationKeys,
} from "./product-specification-item.schema";

/** Replaces a product's *entire* specification set atomically (see
 * `ProductSpecificationRepository.replaceAll`) — specs are edited as a
 * table, not referenced individually elsewhere, so a full replace is
 * simpler and safer than granular per-row endpoints. */
export const replaceProductSpecificationsSchema = z.object({
  specifications: z
    .array(productSpecificationItemSchema)
    .max(PRODUCT_MAX_SPECIFICATIONS)
    .refine(uniqueSpecificationKeys, { message: "Specification keys must be unique" }),
});
