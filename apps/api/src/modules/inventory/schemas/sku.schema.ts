import { z } from "zod";

import { INVENTORY_SKU_MAX_LENGTH } from "../constants";

/** Reusable across `validation/create-inventory-item.schema.ts`. */
export const inventorySkuSchema = z.string().min(1).max(INVENTORY_SKU_MAX_LENGTH);
