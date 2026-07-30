import { z } from "zod";

import { ORDER_COUPON_CODE_MAX_LENGTH } from "../constants";

export const couponCodeSchema = z.string().min(1).max(ORDER_COUPON_CODE_MAX_LENGTH);
