# StackLeo Web (Storefront) — multi-stage build
#
# Built from the monorepo root context:
#   docker build -f apps/web/Dockerfile -t stackleo-web .
#
# Deliberately does NOT use Next's `output: "standalone"` file-tracing
# mode: that mode recreates pnpm's internal symlinked node_modules
# structure via real filesystem symlinks, which requires elevated
# privileges on Windows (fails with EPERM in a normal, non-elevated
# shell) — breaking `next build` for anyone developing on Windows
# without Developer Mode enabled, not just this image's build. Instead,
# the runner stage uses the same `pnpm deploy` technique as
# apps/api/Dockerfile: a pruned, production-only node_modules for just
# this workspace package, with `.next`/`public` copied in explicitly.

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------------------------------------------------------------------------
# deps — install the full workspace once, cached until any manifest changes.
# ---------------------------------------------------------------------------
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/api/package.json apps/api/package.json
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
EXPOSE 3000
CMD ["pnpm", "--filter", "@stackleo/web", "run", "dev"]

# ---------------------------------------------------------------------------
# builder — produce the production build and a deployable package.
# ---------------------------------------------------------------------------
FROM deps AS builder
COPY . .
RUN pnpm --filter @stackleo/web run build
RUN pnpm deploy --filter @stackleo/web --prod /app/deploy/web

# ---------------------------------------------------------------------------
# runner — minimal production image.
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S stackleo && adduser -S stackleo -G stackleo

COPY --from=builder --chown=stackleo:stackleo /app/deploy/web/node_modules ./node_modules
COPY --from=builder --chown=stackleo:stackleo /app/deploy/web/package.json ./package.json
COPY --from=builder --chown=stackleo:stackleo /app/apps/web/.next ./.next
COPY --from=builder --chown=stackleo:stackleo /app/apps/web/public ./public

USER stackleo
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

# Next.js has no dedicated health route in this app (unlike apps/api's
# /health/ready); spidering the homepage is a basic liveness check —
# confirms the server accepts connections and renders a response, not
# any deeper dependency health.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node_modules/.bin/next", "start"]
