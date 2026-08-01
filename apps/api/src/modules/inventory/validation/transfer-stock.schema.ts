import { z } from "zod";

import { INVENTORY_MOVEMENT_REASON_MAX_LENGTH } from "../constants";
import { positiveQuantitySchema } from "../schemas";

/** `destinationWarehouseId` only — never a destination item id. The
 * destination `InventoryItem` for this item's SKU at that warehouse is
 * looked up (or created on first transfer to a new warehouse — see
 * `InventoryRepository.findOrCreateBySkuAndWarehouse`) by
 * `service/inventory.service.ts`'s `transferStock`, so a caller never
 * needs to know whether a stock record already exists there. */
export const transferStockSchema = z.object({
  destinationWarehouseId: z.string().trim().min(1),
  quantity: positiveQuantitySchema,
  reason: z.string().trim().max(INVENTORY_MOVEMENT_REASON_MAX_LENGTH).optional(),
});
