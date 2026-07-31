import type { sendPushSchema } from "../validation";
import type { z } from "zod";

export type SendPushDto = z.infer<typeof sendPushSchema>;
