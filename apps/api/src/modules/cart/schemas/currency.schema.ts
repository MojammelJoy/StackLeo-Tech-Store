import { z } from "zod";

import { CART_CURRENCY_CODE_LENGTH } from "../constants";

/** ISO 4217 currency code, e.g. "USD". */
export const currencySchema = z.string().length(CART_CURRENCY_CODE_LENGTH);
