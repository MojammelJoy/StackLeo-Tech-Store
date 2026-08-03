import { resolve } from "node:path";

import { config as loadDotenvFile } from "dotenv";

/**
 * Loads `apps/api/.env` into `process.env` for local development/test
 * runs. Imported purely for this side effect — as the very first thing
 * `env.ts` does, before `envSchema.safeParse(process.env)` ever runs —
 * since neither `tsx watch src/index.ts` (the `dev` script) nor
 * `node dist/index.js` (the built entrypoint) ever populates
 * `process.env` from a `.env` file on their own; only the Prisma CLI
 * does that automatically, which is why `prisma validate`/`generate`/
 * `migrate dev` already worked while the app itself failed to boot.
 *
 * Skipped entirely once `NODE_ENV` is `"production"`: both the
 * production and staging deployments inject real configuration
 * straight into the container's environment via docker-compose's
 * `env_file`/`environment` (see `docker-compose.production.yml`/
 * `docker-compose.staging.yml` — staging deliberately also sets
 * `NODE_ENV=production`; see `.env.staging.example`'s comment on why),
 * and `.env`/`.env.production`/`.env.staging` are excluded from the
 * built image entirely (see `.dockerignore`) — there is no file to
 * load there. Even without this guard, loading would still be safe:
 * `dotenv.config()` never overrides a variable `process.env` already
 * has, so at worst it could only fill in a gap, never shadow real
 * injected configuration — this check just makes that safety explicit
 * and avoids a pointless filesystem read in production.
 *
 * Resolved relative to this file (via `__dirname`), never
 * `process.cwd()`: this file lives at `apps/api/src/config/` in
 * development (tsx runs the source directly) and compiles to
 * `apps/api/dist/config/` (see `tsconfig.json`'s `outDir`) — both are
 * two directories below `apps/api/`, so `../../.env` resolves to
 * `apps/api/.env` in either case, regardless of which directory the
 * process was actually launched from.
 */
if (process.env.NODE_ENV !== "production") {
  loadDotenvFile({ path: resolve(__dirname, "../../.env") });
}
