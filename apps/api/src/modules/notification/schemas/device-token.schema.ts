import { z } from "zod";

export const deviceTokenSchema = z.string().min(1);
