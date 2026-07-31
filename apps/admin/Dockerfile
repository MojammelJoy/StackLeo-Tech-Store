# StackLeo Admin (Internal Dashboard) — multi-stage build
#
# Built from the monorepo root context:
#   docker build -f apps/admin/Dockerfile -t stackleo-admin .
#
# See apps/web/Dockerfile's header comment — this app is built the same
# way (pnpm deploy for a pruned production node_modules, monorepo-relative
# copy paths; deliberately not Next's `output: "standalone"` mode).

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------------------------------------------------------------------------
# deps — install the full workspace once, cached until any manifest changes.
# ---------------------------------------------------------------------------
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/admin/package.json apps/admin/package.json
COPY apps/web/package.json apps/web/package.json
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
CMD ["pnpm", "--filter", "@stackleo/admin", "run", "dev"]

# ---------------------------------------------------------------------------
# builder — produce the production build and a deployable package.
# ---------------------------------------------------------------------------
FROM deps AS builder
COPY . .
RUN pnpm --filter @stackleo/admin run build
RUN pnpm deploy --filter @stackleo/admin --prod /app/deploy/admin

# ---------------------------------------------------------------------------
# runner — minimal production image.
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S stackleo && adduser -S stackleo -G stackleo

COPY --from=builder --chown=stackleo:stackleo /app/deploy/admin/node_modules ./node_modules
COPY --from=builder --chown=stackleo:stackleo /app/deploy/admin/package.json ./package.json
COPY --from=builder --chown=stackleo:stackleo /app/apps/admin/.next ./.next
COPY --from=builder --chown=stackleo:stackleo /app/apps/admin/public ./public

USER stackleo
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node_modules/.bin/next", "start"]
