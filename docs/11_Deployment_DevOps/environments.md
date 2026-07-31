# Environments

How local development, staging, and production are each configured and started with this repository's Docker Compose setup, and what actually differs between them.

## The four Compose files

`docker-compose.yml` is the base — it defines every service (`postgres`, `redis`, `api`, `web`, `admin`) and how they're wired together, but publishes no application ports to the host and pins no build target. It's never run alone; one of the three files below always layers on top of it.

| File                            | Loaded when                                              | Build target        | Host ports                                       | Reverse proxy |
| ------------------------------- | -------------------------------------------------------- | ------------------- | ------------------------------------------------ | ------------- |
| `docker-compose.override.yml`   | `docker compose up` (auto-merged, no `-f` needed)        | `dev` (live reload) | Everything, direct: 5432, 6379, 4000, 3000, 3001 | None          |
| `docker-compose.staging.yml`    | `-f docker-compose.yml -f docker-compose.staging.yml`    | `runner`            | Only nginx: 8080                                 | Yes           |
| `docker-compose.production.yml` | `-f docker-compose.yml -f docker-compose.production.yml` | `runner`            | Only nginx: 80                                   | Yes           |

Postgres and Redis publish no host port outside local development — staging and production only reach them over the internal Compose network.

## Local development

```bash
docker compose up
```

Bind-mounts your working copy into each app container and runs `pnpm dev` inside it — edit source on the host, see it reload in the container. Connect to Postgres/Redis directly at `localhost:5432`/`localhost:6379`, and hit the apps directly at `localhost:4000` (api), `localhost:3000` (web), `localhost:3001` (admin) — no reverse proxy in this mode.

## Staging

```bash
cp apps/api/.env.staging.example apps/api/.env.staging   # fill in real values
bash scripts/deploy.sh staging
```

Or run the underlying Compose commands directly:

```bash
docker compose -f docker-compose.yml -f docker-compose.staging.yml build
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

Runs the production build target end to end (same images production would run), fronted by nginx on `localhost:8080`. `NODE_ENV` is still `production` in `.env.staging` — see that file's own header comment for why (the app's env schema has no separate "staging" value; staging is distinguished by which database/secrets it points at, not by `NODE_ENV`).

## Production

```bash
cp apps/api/.env.production.example apps/api/.env.production   # fill in real values
bash scripts/deploy.sh production
```

**Read [`production-checklist.md`](./production-checklist.md) in full before running this against a real environment.** Adds resource limits, `restart: always`, and prepares `api` for horizontal scaling (`deploy.replicas: 2`, honored only under Swarm — for plain `docker compose`, scale explicitly: `... up -d --scale api=3`). `docker/nginx/nginx.conf` load-balances across however many `api` replicas exist, re-resolving Docker's embedded DNS per request rather than caching a single container's address.

## What's deliberately not here

- **TLS/HTTPS** — `docker/nginx/nginx.conf` listens on plain HTTP only; see that file's header comment for where a certificate would plug in.
- **Cloud-specific deployment** — `apps/web`/`apps/admin`'s actual production target remains a managed platform (Vercel/Render) per the root `README.md`; this Compose stack is the self-hosted alternative, not a replacement for it. See `.github/workflows/cd.yml`'s placeholder deploy steps.
- **Kubernetes** — see [`future-kubernetes-migration.md`](./future-kubernetes-migration.md).
- **Metrics-based monitoring integrations** (Prometheus/Grafana) — see `docs/10_Monitoring_Observability/monitoring-configuration.md`.
