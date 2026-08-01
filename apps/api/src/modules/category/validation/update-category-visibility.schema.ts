import { z } from "zod";

import { CATEGORY_VISIBILITIES } from "../constants";

export const updateCategoryVisibilitySchema = z.object({
  visibility: z.enum([CATEGORY_VISIBILITIES.PUBLIC, CATEGORY_VISIBILITIES.PRIVATE]),
});
