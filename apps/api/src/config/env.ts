import "./load-env";

import { envSchema, type Env } from "./env.schema";

/**
 * Parses and validates `process.env` once, at module load time. Throws
 * immediately — crashing startup — if required variables are missing or
 * invalid. An invalid environment should never reach a running server.
 *
 * `./load-env` is imported first, purely for its side effect of
 * populating `process.env` from `apps/api/.env` in development/test —
 * see that module's doc comment for why this app needs that at all
 * (unlike the Prisma CLI, nothing else in the bootstrap loads it) and
 * why doing so is still safe in production.
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
