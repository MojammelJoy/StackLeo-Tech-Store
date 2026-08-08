import type { createInAppNotificationSchema } from "../validation";
import type { z } from "zod";

export type CreateInAppNotificationDto = z.infer<typeof createInAppNotificationSchema>;
