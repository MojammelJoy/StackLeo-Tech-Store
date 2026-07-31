# Production Checklist

Verify every item before running `bash scripts/deploy.sh production` (or the underlying `docker compose -f docker-compose.yml -f docker-compose.production.yml` commands) against a real environment.

## Environment & secrets

- [ ] `apps/api/.env.production` exists, is filled in with real values (not the `.env.production.example` placeholders), and passes `bash scripts/validate-env.sh apps/api/.env.example apps/api/.env.production`.
- [ ] `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` are freshly generated (e.g. `openssl rand -hex 32`), at least 32 characters, and distinct from every other environment's secrets.
- [ ] `DATABASE_URL`/`REDIS_URL` point at real, production-only infrastructure — never a development or staging instance.
- [ ] `CORS_ALLOWED_ORIGINS` lists only real production origins — no `localhost`, no wildcard.
- [ ] `.env.production` is not committed to git (`.gitignore` excludes it — confirm with `git check-ignore apps/api/.env.production`).

## Data safety

- [ ] A fresh backup exists (`bash scripts/backup-db.sh`) and its restorability has been verified — see `backup-strategy.md`.
- [ ] Any Prisma migration this release includes has been reviewed for destructive changes (dropped columns/tables, changed constraints) — see `rollback-strategy.md`'s database-rollback guidance.

## Build & health

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` all pass at the repository root (the same gates `.github/workflows/ci.yml` runs).
- [ ] Images build successfully: `docker compose -f docker-compose.yml -f docker-compose.production.yml build`.
- [ ] After starting the stack, `api`'s container reports `healthy`: `docker inspect --format='{{.State.Health.Status}}' stackleo-api`.
- [ ] `web`/`admin` respond 200 through nginx (adjust the `Host` header to match `docker/nginx/nginx.conf`'s configured domains).

## Reverse proxy & scaling

- [ ] `docker/nginx/nginx.conf`'s placeholder `*.stackleo.example` domains have been replaced with the real ones.
- [ ] TLS is provisioned in front of nginx (this repository ships HTTP-only — see `environments.md`'s "What's deliberately not here").
- [ ] If running more than one `api` replica (`--scale api=N`), confirm nginx is actually load-balancing across them (repeated requests should not always hit the same container — check each replica's own logs).

## Rollback readiness

- [ ] The previous known-good commit/image is identified and recorded before deploying — see `rollback-strategy.md`.
- [ ] Whoever is deploying has read `rollback-strategy.md` and knows how to execute it if this deployment needs to be reversed.

## Sign-off

- [ ] This checklist has been completed by the person performing the deployment, not assumed complete from a previous deployment.
