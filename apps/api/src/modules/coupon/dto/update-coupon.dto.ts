import type { updateCouponSchema } from "../validation";
import type { z } from "zod";

export type UpdateCouponDto = z.infer<typeof updateCouponSchema>;
