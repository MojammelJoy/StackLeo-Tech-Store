import { z } from "zod";

import { PAYMENT_METHOD_PROVIDERS, PAYMENT_METHODS, PAYMENT_PROVIDERS } from "../constants";

/**
 * Every field is optional: a bare retry (empty body) reuses the failed
 * payment's own `method`/`provider` — the common case, a customer just
 * clicking "try again." Supplying `method`/`provider` lets them switch
 * (e.g. a failed card attempt retried as cash on delivery instead); if
 * either is given, both must be given together so the
 * `PAYMENT_METHOD_PROVIDERS` cross-check below has a complete pair to
 * validate — the same reasoning `validation/create-payment.schema.ts`
 * documents.
 */
export const retryPaymentSchema = z
  .object({
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
  })
  .partial()
  .refine((data) => (data.method === undefined) === (data.provider === undefined), {
    message: "method and provider must be supplied together",
    path: ["provider"],
  })
  .refine(
    (data) =>
      data.method === undefined ||
      data.provider === undefined ||
      PAYMENT_METHOD_PROVIDERS[data.method].includes(data.provider),
    { message: "provider is not valid for the selected payment method", path: ["provider"] },
  );
