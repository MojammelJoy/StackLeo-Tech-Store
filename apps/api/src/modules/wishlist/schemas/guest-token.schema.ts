import { z } from "zod";

export const guestTokenSchema = z.string().min(1);
