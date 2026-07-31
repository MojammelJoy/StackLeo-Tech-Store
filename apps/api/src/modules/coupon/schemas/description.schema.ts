import { z } from "zod";

import { COUPON_DESCRIPTION_MAX_LENGTH } from "../constants";

export const descriptionSchema = z.string().max(COUPON_DESCRIPTION_MAX_LENGTH);
