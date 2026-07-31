import type { createCouponSchema } from "../validation";
import type { z } from "zod";

export type CreateCouponDto = z.infer<typeof createCouponSchema>;
