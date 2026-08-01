import { z } from "zod";

import {
  PRODUCT_SPECIFICATION_KEY_MAX_LENGTH,
  PRODUCT_SPECIFICATION_VALUE_MAX_LENGTH,
} from "../constants";

/** One row of a specification set — shared between
 * `replaceProductSpecificationsSchema` and `createProductSchema`'s
 * optional initial `specifications`, so both enforce the exact same
 * shape. */
export const productSpecificationItemSchema = z.object({
  key: z.string().trim().min(1).max(PRODUCT_SPECIFICATION_KEY_MAX_LENGTH),
  value: z.string().trim().min(1).max(PRODUCT_SPECIFICATION_VALUE_MAX_LENGTH),
  sortOrder: z.number().int().min(0).optional(),
});

export function uniqueSpecificationKeys(items: { key: string }[]): boolean {
  return new Set(items.map((item) => item.key)).size === items.length;
}
