import type { resetPasswordSchema } from "../validation";
import type { z } from "zod";

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
