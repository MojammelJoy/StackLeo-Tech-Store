import type { sendSmsSchema } from "../validation";
import type { z } from "zod";

export type SendSmsDto = z.infer<typeof sendSmsSchema>;
