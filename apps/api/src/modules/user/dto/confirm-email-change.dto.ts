import type { confirmEmailChangeSchema } from "../validation";
import type { z } from "zod";

export type ConfirmEmailChangeDto = z.infer<typeof confirmEmailChangeSchema>;
