import type { updateFulfillmentStatusSchema } from "../validation";
import type { z } from "zod";

export type UpdateFulfillmentStatusDto = z.infer<typeof updateFulfillmentStatusSchema>;
