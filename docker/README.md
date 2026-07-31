# docker/

Local and self-hosted infrastructure orchestration support for StackLeo Tech Store.

## Purpose

Holds infrastructure-level Docker assets that are _not_ specific to a single application. Each app's own container definition lives beside it (`apps/*/Dockerfile`); the root [`docker-compose.yml`](../docker-compose.yml) and its environment overlays (`docker-compose.override.yml`, `docker-compose.staging.yml`, `docker-compose.production.yml`) orchestrate them together with the infrastructure defined here. See [`docs/11_Deployment_DevOps/environments.md`](../docs/11_Deployment_DevOps/environments.md) for the full picture.

## Structure

```text
docker/
├── postgres/                    # PostgreSQL init scripts / configuration overrides (placeholder)
├── redis/                       # Redis configuration overrides (placeholder)
├── nginx/
│   └── nginx.conf               # Reverse proxy for staging/production (subdomain-routed, scaling-aware)
├── prometheus/
│   └── prometheus.yml.example   # Future metrics scrape config — not wired in; apps/api has no /metrics route yet
└── README.md
```

## Conventions

- Application Dockerfiles stay with their app (`apps/web/Dockerfile`, `apps/admin/Dockerfile`, `apps/api/Dockerfile`); this folder is reserved for shared infrastructure only.
- The primary production deployment target for `apps/web`/`apps/admin` remains a managed platform (Vercel/Render, per the root [`README.md`](../README.md)'s tech table) — this folder's `docker-compose.production.yml`-driven stack is the self-hosted alternative (or a staging environment) for whoever isn't using those platforms, not a replacement for them.
- `nginx/nginx.conf` is a reference configuration: it uses placeholder `*.stackleo.example` domains and no TLS — see that file's own header comment before pointing it at a real domain.
- `prometheus/prometheus.yml.example` is intentionally not renamed to `prometheus.yml` or referenced by any compose file — wiring it in requires `apps/api` to expose a `/metrics` route first, which is application code and out of scope here.
