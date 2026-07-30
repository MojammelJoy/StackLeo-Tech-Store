import { z } from "zod";

import { INVENTORY_LOW_STOCK_THRESHOLD_DEFAULT, INVENTORY_STATUSES } from "../constants";
import { inventorySkuSchema, nonNegativeQuantitySchema } from "../schemas";

export const createInventoryItemSchema = z
  .object({
    sku: inventorySkuSchema,
    warehouseId: z.string().min(1),
    quantity: nonNegativeQuantitySchema.default(0),
    reservedQuantity: nonNegativeQuantitySchema.default(0),
    lowStockThreshold: nonNegativeQuantitySchema.default(INVENTORY_LOW_STOCK_THRESHOLD_DEFAULT),
    status: z
      .enum([
        INVENTORY_STATUSES.IN_STOCK,
        INVENTORY_STATUSES.LOW_STOCK,
        INVENTORY_STATUSES.OUT_OF_STOCK,
        INVENTORY_STATUSES.DISCONTINUED,
      ])
      .default(INVENTORY_STATUSES.IN_STOCK),
  })
  .refine((data) => data.reservedQuantity <= data.quantity, {
    message: "Reserved quantity cannot exceed total quantity",
    path: ["reservedQuantity"],
  });
