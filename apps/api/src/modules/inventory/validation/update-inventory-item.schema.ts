import { z } from "zod";

import { INVENTORY_STATUSES } from "../constants";
import { nonNegativeQuantitySchema } from "../schemas";

/**
 * Deliberately excludes `sku`/`warehouseId` — see `UpdateInventoryItemInput`'s
 * comment in `types/inventory.types.ts` for why. Also deliberately does
 * NOT re-apply the create schema's "reserved <= quantity" `.refine()`:
 * a partial update may touch only one of the two fields, and checking
 * the invariant correctly would require reading the item's current
 * persisted values — something validation-layer code has no business
 * doing. That check belongs to a future concrete service implementation,
 * which has the current record to check against.
 */
export const updateInventoryItemSchema = z
  .object({
    quantity: nonNegativeQuantitySchema,
    reservedQuantity: nonNegativeQuantitySchema,
    lowStockThreshold: nonNegativeQuantitySchema,
    status: z.enum([
      INVENTORY_STATUSES.IN_STOCK,
      INVENTORY_STATUSES.LOW_STOCK,
      INVENTORY_STATUSES.OUT_OF_STOCK,
      INVENTORY_STATUSES.DISCONTINUED,
    ]),
  })
  .partial();
