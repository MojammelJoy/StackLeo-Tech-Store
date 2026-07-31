import type { verifyEmailSchema } from "../validation";
import type { z } from "zod";

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
