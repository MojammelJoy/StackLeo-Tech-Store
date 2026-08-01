import type { updatePreferencesSchema } from "../validation";
import type { z } from "zod";

export type UpdatePreferencesDto = z.infer<typeof updatePreferencesSchema>;
