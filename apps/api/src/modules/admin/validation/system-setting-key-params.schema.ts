import { z } from "zod";

import { systemSettingKeySchema } from "../schemas";

export const systemSettingKeyParamsSchema = z.object({
  key: systemSettingKeySchema,
});
