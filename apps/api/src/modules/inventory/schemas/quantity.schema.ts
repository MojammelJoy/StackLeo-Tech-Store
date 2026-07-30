import { z } from "zod";

import { INVENTORY_QUANTITY_MIN } from "../constants";

/**
 * Reusable across `quantity`, `reservedQuantity`, and `lowStockThreshold`
 * — all three are non-negative integer stock levels. Distinct from
 * `movement-quantity.schema.ts`'s `positiveQuantitySchema`: a stock
 * level can legitimately be zero, a movement's magnitude cannot.
 */
export const nonNegativeQuantitySchema = z.number().int().min(INVENTORY_QUANTITY_MIN);
