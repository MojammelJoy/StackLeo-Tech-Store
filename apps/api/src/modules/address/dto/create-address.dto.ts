import type { createAddressSchema } from "../validation";
import type { z } from "zod";

export type CreateAddressDto = z.infer<typeof createAddressSchema>;
