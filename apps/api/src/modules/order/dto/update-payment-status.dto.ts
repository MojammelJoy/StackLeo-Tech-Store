import type { updatePaymentStatusSchema } from "../validation";
import type { z } from "zod";

export type UpdatePaymentStatusDto = z.infer<typeof updatePaymentStatusSchema>;
