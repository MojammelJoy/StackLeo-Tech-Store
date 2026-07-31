import type { createNotificationSchema } from "../validation";
import type { z } from "zod";

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;
