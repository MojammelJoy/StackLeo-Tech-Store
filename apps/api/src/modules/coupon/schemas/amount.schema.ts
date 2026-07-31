import { z } from "zod";

/** A positive minor-unit amount — used for both `minOrderAmount` and
 * `maxDiscountAmount`. */
export const amountSchema = z.number().int().positive();
