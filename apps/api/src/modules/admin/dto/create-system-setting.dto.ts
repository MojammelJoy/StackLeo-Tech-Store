import type { createSystemSettingSchema } from "../validation";
import type { z } from "zod";

export type CreateSystemSettingDto = z.infer<typeof createSystemSettingSchema>;
