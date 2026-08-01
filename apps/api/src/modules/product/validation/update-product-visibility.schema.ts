import { z } from "zod";

import { PRODUCT_VISIBILITIES } from "../constants";

export const updateProductVisibilitySchema = z.object({
  visibility: z.enum([PRODUCT_VISIBILITIES.PUBLIC, PRODUCT_VISIBILITIES.PRIVATE]),
});
