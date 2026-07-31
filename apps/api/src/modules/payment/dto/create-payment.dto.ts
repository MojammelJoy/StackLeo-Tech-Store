import type { createPaymentSchema } from "../validation";
import type { z } from "zod";

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
