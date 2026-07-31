import { z } from "zod";

import { bodySchema, emailAddressSchema, subjectSchema } from "../schemas";

export const sendEmailSchema = z.object({
  to: emailAddressSchema,
  subject: subjectSchema,
  body: bodySchema,
  templateKey: z.string().min(1).optional(),
  variables: z.record(z.string()).optional(),
});
