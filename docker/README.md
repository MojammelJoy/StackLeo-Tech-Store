# docker/

Local infrastructure orchestration support for StackLeo Tech Store.

## Purpose

Holds infrastructure-level Docker assets that are *not* specific to a single application. Each app's own container definition lives beside it (`apps/*/Dockerfile`); the root [`docker-compose.yml`](../docker-compose.yml) orchestrates them together with the infrastructure defined here.

## Structure

```text
docker/
├── postgres/    # PostgreSQL init scripts / configuration overrides (placeholder)
├── redis/         # Redis configuration overrides (placeholder)
└── README.md
```

## Conventions

- Application Dockerfiles stay with their app (`apps/web/Dockerfile`, `apps/admin/Dockerfile`, `apps/api/Dockerfile`); this folder is reserved for shared infrastructure only.
- Nothing here should be environment-specific to production — production infrastructure is provisioned through the deployment platforms (Vercel, Render), not this folder.
