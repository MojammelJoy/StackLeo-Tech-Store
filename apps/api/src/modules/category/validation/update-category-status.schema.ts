import { z } from "zod";

import { CATEGORY_STATUSES } from "../constants";

export const updateCategoryStatusSchema = z.object({
  status: z.enum([CATEGORY_STATUSES.DRAFT, CATEGORY_STATUSES.ACTIVE, CATEGORY_STATUSES.ARCHIVED]),
});
