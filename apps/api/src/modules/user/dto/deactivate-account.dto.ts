import type { deactivateAccountSchema } from "../validation";
import type { z } from "zod";

export type DeactivateAccountDto = z.infer<typeof deactivateAccountSchema>;
