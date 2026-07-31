import type { forgotPasswordSchema } from "../validation";
import type { z } from "zod";

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
