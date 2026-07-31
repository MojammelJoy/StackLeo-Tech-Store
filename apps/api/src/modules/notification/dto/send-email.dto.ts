import type { sendEmailSchema } from "../validation";
import type { z } from "zod";

export type SendEmailDto = z.infer<typeof sendEmailSchema>;
