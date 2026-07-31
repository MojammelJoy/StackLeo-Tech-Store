# StackLeo API — multi-stage build
#
# Built from the monorepo root context (pnpm workspace deps and the
# root lockfile aren't visible from inside apps/api alone):
#   docker build -f apps/api/Dockerfile -t stackleo-api .
#
# Stages:
#   deps    — installs the full pnpm workspace (needed once; every
#             other stage builds on top of it).
#   dev     — local development target: full source, live reload via
#             `pnpm dev`. Used by docker-compose.override.yml, which
#             bind-mounts source over this so edits apply without a
#             rebuild.
#   builder — generates the Prisma client and compiles apps/api to
#             dist/, then uses `pnpm deploy` to produce a self-contained,
#             production-only node_modules for just this one workspace
#             package (resolves every `workspace:*` dependency into a
#             real copy — nothing for the runner stage to symlink).
#   runner  — the actual production image: compiled output + a pruned
#             node_modules only, running as a non-root user.
#
# No `@stackleo/*` shared package is currently imported by apps/api's
# source (every module in this app defines its own types/constants —
# see the module-level "no sibling imports" discipline throughout
# src/modules/), so no separate "build the shared packages first" step
# is needed here; `pnpm deploy` still resolves them correctly if that
# ever changes.

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------------------------------------------------------------------------
# deps — install the full workspace once, cached until any manifest changes.
# ---------------------------------------------------------------------------
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/constants/package.json packages/constants/package.json
COPY packages/utils/package.json packages/utils/package.json
COPY packages/validation/package.json packages/validation/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/config/package.json packages/config/package.json
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# dev — local development target (see docker-compose.override.yml).
# ---------------------------------------------------------------------------
FROM deps AS dev
COPY . .
EXPOSE 4000
CMD ["pnpm", "--filter", "@stackleo/api", "run", "dev"]

# ---------------------------------------------------------------------------
# builder — compile + produce a deployable, production-only package.
# ---------------------------------------------------------------------------
FROM deps AS builder
COPY . .
RUN pnpm --filter @stackleo/api run prisma:generate
RUN pnpm --filter @stackleo/api run build
RUN pnpm deploy --filter @stackleo/api --prod /app/deploy/api

# ---------------------------------------------------------------------------
# runner — minimal production image.
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S stackleo && adduser -S stackleo -G stackleo

COPY --from=builder --chown=stackleo:stackleo /app/deploy/api/dist ./dist
COPY --from=builder --chown=stackleo:stackleo /app/deploy/api/node_modules ./node_modules
COPY --from=builder --chown=stackleo:stackleo /app/deploy/api/package.json ./package.json
COPY --from=builder --chown=stackleo:stackleo /app/apps/api/prisma ./prisma

USER stackleo
EXPOSE 4000

# `/health/ready` (see src/health/) verifies both the database and Redis
# round-trip, not just that the process is up — the same check a load
# balancer's readiness probe would use. Alpine's busybox `wget` is used
# instead of `curl` to avoid installing an extra package into the image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health/ready || exit 1

CMD ["node", "dist/index.js"]
