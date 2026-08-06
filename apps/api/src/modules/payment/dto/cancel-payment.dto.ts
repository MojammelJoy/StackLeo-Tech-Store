import type { cancelPaymentSchema } from "../validation";
import type { z } from "zod";

export type CancelPaymentDto = z.infer<typeof cancelPaymentSchema>;
