import { z } from "zod";

import { PAYMENT_MIN_AMOUNT } from "../constants";

/** An amount in the currency's minor unit — always a positive integer,
 * never a float, to avoid floating-point rounding on money. */
export const amountSchema = z.number().int().min(PAYMENT_MIN_AMOUNT);
