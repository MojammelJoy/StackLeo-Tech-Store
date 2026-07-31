import { z } from "zod";

import { couponCodeSchema } from "../schemas";

export const applyCouponSchema = z.object({
  code: couponCodeSchema,
});
