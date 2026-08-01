import { z } from "zod";

import { INVENTORY_STATUSES } from "../constants";
import { nonNegativeQuantitySchema } from "../schemas";

/**
 * Deliberately excludes `sku`/`warehouseId` (identity fields — see
 * `UpdateInventoryItemInput`'s comment in `types/inventory.types.ts`)
 * and `quantity`/`reservedQuantity` (every quantity change must go
 * through a movement-tracked operation — see that same comment for
 * why). Only `lowStockThreshold` and `status` are genuinely
 * general-purpose attribute edits.
 */
export const updateInventoryItemSchema = z
  .object({
    lowStockThreshold: nonNegativeQuantitySchema,
    status: z.enum([
      INVENTORY_STATUSES.IN_STOCK,
      INVENTORY_STATUSES.LOW_STOCK,
      INVENTORY_STATUSES.OUT_OF_STOCK,
      INVENTORY_STATUSES.DISCONTINUED,
    ]),
  })
  .partial();
