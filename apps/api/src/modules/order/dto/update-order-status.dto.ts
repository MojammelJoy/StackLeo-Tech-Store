import type { updateOrderStatusSchema } from "../validation";
import type { z } from "zod";

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
