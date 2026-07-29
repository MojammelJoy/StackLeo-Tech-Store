import { envSchema, type Env } from "./env.schema";

/**
 * Parses and validates `process.env` once, at module load time. Throws
 * immediately — crashing startup — if required variables are missing or
 * invalid. An invalid environment should never reach a running server.
 */
function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return parsed.data;
}

export const env = loadEnv();
