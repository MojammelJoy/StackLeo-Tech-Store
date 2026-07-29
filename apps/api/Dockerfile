# StackLeo API — placeholder Dockerfile
#
# Multi-stage build skeleton for the Express API. Intended to be built
# from the monorepo root context: `docker build -f apps/api/Dockerfile .`

FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
# COPY package.json, workspace manifests, and install dependencies here.

FROM base AS builder
WORKDIR /app
# COPY source, run `prisma generate`, and run `npm run build` here.

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 4000
# COPY the compiled dist/ output and set the start command here.
