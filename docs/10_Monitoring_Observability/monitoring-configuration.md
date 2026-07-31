# Monitoring Configuration

What health signals exist today, and what's prepared — but not wired in — for future metrics-based monitoring.

## What exists today: health checks

`apps/api` already exposes three endpoints (`apps/api/src/health/`), unchanged by this deployment foundation:

| Endpoint            | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `GET /health`       | General health summary.                                        |
| `GET /health/live`  | Liveness — is the process itself running.                      |
| `GET /health/ready` | Readiness — does the process, database, and Redis all respond. |

This foundation's contribution is _wiring these into infrastructure_ that acts on them:

- **`apps/api/Dockerfile`**'s `HEALTHCHECK` polls `/health/ready` every 30s; Docker reports the container `unhealthy` after 3 consecutive failures.
- **`docker-compose.yml`** gates `api`'s startup on `postgres`/`redis` reporting healthy (`depends_on: condition: service_healthy`), and `scripts/deploy.sh` waits for the `api` container itself to report healthy before declaring a deployment complete.
- **`apps/web`/`apps/admin`** have no equivalent readiness endpoint (nothing in either app depends on a database or cache); their `HEALTHCHECK` is a basic "does the homepage respond" check — see each Dockerfile's own comment.

This is monitoring in the "is it up" sense — a load balancer or orchestrator's exact use case for a health check. It is not metrics-based monitoring (throughput, latency percentiles, error rates over time).

## What's prepared but not wired in: metrics

`apps/api` exposes no `/metrics` endpoint — adding one (e.g. via `prom-client`) is application code, out of scope here. What _is_ prepared:

- **`docker/prometheus/prometheus.yml.example`** — a ready-to-use Prometheus scrape config targeting `api:4000/metrics`, intentionally named `.example` and not referenced by any Compose file, so it does nothing until both a `/metrics` route exists and a `prometheus` service is actually added to a Compose overlay.

## Getting from here to real monitoring

1. Add a `/metrics` route to `apps/api` (application code — a separate piece of work).
2. Rename `docker/prometheus/prometheus.yml.example` to `prometheus.yml`.
3. Add a `prometheus` service to `docker-compose.production.yml` (image: `prom/prometheus`, mounting that file to `/etc/prometheus/prometheus.yml`).
4. Add Grafana (or another dashboard layer) pointed at that Prometheus instance for actual dashboards/alerting — not configured here; no specific dashboard tool is chosen or assumed.

None of the above is implemented in this foundation — see "Future monitoring integrations" in `docs/11_Deployment_DevOps/environments.md`.
