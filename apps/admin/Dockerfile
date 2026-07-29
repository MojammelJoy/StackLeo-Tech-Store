# StackLeo Admin (Internal Dashboard) — placeholder Dockerfile
#
# Multi-stage build skeleton for the Next.js admin dashboard. Intended to be
# built from the monorepo root context: `docker build -f apps/admin/Dockerfile .`

FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
# COPY package.json, workspace manifests, and install dependencies here.

FROM base AS builder
WORKDIR /app
# COPY source and run `next build` here.

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000
# COPY the standalone build output and set the start command here.
