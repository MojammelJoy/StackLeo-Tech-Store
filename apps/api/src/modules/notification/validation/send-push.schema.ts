import { z } from "zod";

import { bodySchema, deviceTokenSchema, subjectSchema } from "../schemas";

export const sendPushSchema = z.object({
  deviceToken: deviceTokenSchema,
  title: subjectSchema,
  body: bodySchema,
  data: z.record(z.string()).optional(),
});
