import type { sendInAppSchema } from "../validation";
import type { z } from "zod";

export type SendInAppDto = z.infer<typeof sendInAppSchema>;
