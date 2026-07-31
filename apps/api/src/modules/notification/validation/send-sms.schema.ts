import { z } from "zod";

import { bodySchema, phoneNumberSchema } from "../schemas";

export const sendSmsSchema = z.object({
  to: phoneNumberSchema,
  body: bodySchema,
});
