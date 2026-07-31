import { z } from "zod";

import { PAYMENT_METHOD_PROVIDERS, PAYMENT_METHODS, PAYMENT_PROVIDERS } from "../constants";
import { amountSchema, currencyCodeSchema } from "../schemas";

/**
 * `orderId` is a bare string reference; this module never imports
 * `modules/order` (see `types/payment.types.ts`). `provider` must be one
 * `PAYMENT_METHOD_PROVIDERS` recognizes for the given `method` — enforced
 * via that shared mapping rather than duplicating it here, so validation
 * and the mapping can never drift apart. Never an `amount`/`currency`
 * a client invents freely without server-side pricing in a real
 * implementation — that reconciliation is `service/`'s concern, out of
 * scope for this foundation.
 */
export const createPaymentSchema = z
  .object({
    orderId: z.string().min(1),
    method: z.enum([
      PAYMENT_METHODS.CARD,
      PAYMENT_METHODS.MOBILE_BANKING,
      PAYMENT_METHODS.BANK_TRANSFER,
      PAYMENT_METHODS.CASH_ON_DELIVERY,
    ]),
    provider: z.enum([
      PAYMENT_PROVIDERS.STRIPE,
      PAYMENT_PROVIDERS.SSLCOMMERZ,
      PAYMENT_PROVIDERS.BKASH,
      PAYMENT_PROVIDERS.NAGAD,
      PAYMENT_PROVIDERS.MANUAL,
    ]),
    amount: amountSchema,
    currency: currencyCodeSchema,
  })
  .refine((data) => PAYMENT_METHOD_PROVIDERS[data.method].includes(data.provider), {
    message: "provider is not valid for the selected payment method",
    path: ["provider"],
  });
