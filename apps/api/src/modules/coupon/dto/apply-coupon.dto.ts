import type { applyCouponSchema } from "../validation";
import type { z } from "zod";

export type ApplyCouponDto = z.infer<typeof applyCouponSchema>;
