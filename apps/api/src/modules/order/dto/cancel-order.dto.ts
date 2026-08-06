import type { cancelOrderSchema } from "../validation";
import type { z } from "zod";

export type CancelOrderDto = z.infer<typeof cancelOrderSchema>;
