import { z } from "zod";

import { rawTokenSchema } from "../schemas";

export const verifyEmailSchema = z.object({
  token: rawTokenSchema,
});
