import { z } from "zod";

import { BRAND_VISIBILITIES } from "../constants";

export const updateBrandVisibilitySchema = z.object({
  visibility: z.enum([BRAND_VISIBILITIES.PUBLIC, BRAND_VISIBILITIES.PRIVATE]),
});
