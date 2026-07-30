import { z } from "zod";

import { USER_PASSWORD_MAX_LENGTH, USER_PASSWORD_MIN_LENGTH } from "../constants";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(USER_PASSWORD_MIN_LENGTH).max(USER_PASSWORD_MAX_LENGTH),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
