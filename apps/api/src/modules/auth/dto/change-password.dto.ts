import type { changePasswordSchema } from "../validation";
import type { z } from "zod";

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
