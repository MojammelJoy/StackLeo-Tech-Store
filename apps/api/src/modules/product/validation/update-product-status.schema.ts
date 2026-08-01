import { z } from "zod";

import { PRODUCT_STATUSES } from "../constants";

export const updateProductStatusSchema = z.object({
  status: z.enum([PRODUCT_STATUSES.DRAFT, PRODUCT_STATUSES.ACTIVE, PRODUCT_STATUSES.ARCHIVED]),
});
