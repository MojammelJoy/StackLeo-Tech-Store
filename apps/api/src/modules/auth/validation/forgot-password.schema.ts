import { z } from "zod";

import { emailSchema } from "../schemas";

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
