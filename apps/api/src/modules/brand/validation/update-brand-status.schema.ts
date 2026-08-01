import { z } from "zod";

import { BRAND_STATUSES } from "../constants";

export const updateBrandStatusSchema = z.object({
  status: z.enum([BRAND_STATUSES.DRAFT, BRAND_STATUSES.ACTIVE, BRAND_STATUSES.ARCHIVED]),
});
