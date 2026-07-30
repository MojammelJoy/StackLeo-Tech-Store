import type { createOrderSchema } from "../validation";
import type { z } from "zod";

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
