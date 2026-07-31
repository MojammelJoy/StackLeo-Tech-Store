import { z } from "zod";

import { bodySchema, subjectSchema } from "../schemas";

export const sendInAppSchema = z.object({
  userId: z.string().min(1),
  title: subjectSchema,
  body: bodySchema,
});
