import { z } from "zod";

import { passwordSchema, rawTokenSchema } from "../schemas";

export const resetPasswordSchema = z.object({
  token: rawTokenSchema,
  password: passwordSchema,
});
