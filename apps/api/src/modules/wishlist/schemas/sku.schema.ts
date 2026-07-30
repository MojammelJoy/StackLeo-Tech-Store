import { z } from "zod";

import { WISHLIST_SKU_MAX_LENGTH } from "../constants";

export const skuSchema = z.string().min(1).max(WISHLIST_SKU_MAX_LENGTH);
