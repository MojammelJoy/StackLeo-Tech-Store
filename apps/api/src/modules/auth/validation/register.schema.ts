import { z } from "zod";

import { emailSchema, passwordSchema } from "../schemas";

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
