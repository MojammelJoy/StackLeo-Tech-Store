# Future Kubernetes Migration

Conceptual only — no Kubernetes manifests exist in this repository, and adding them is explicitly out of scope for this deployment foundation. This document exists so that if/when a real migration happens, there's already a documented starting map from what exists today to what Kubernetes would need, instead of designing that mapping from scratch under deployment pressure.

## Why this is deferred

The current Compose-based stack (`docker-compose.yml` + environment overlays) already provides the properties Kubernetes would formalize — service discovery by name, health-gated startup ordering, horizontal scaling of `api` via `--scale`, a reverse proxy that tolerates replica count changing — at a much smaller operational cost than running a cluster. Migrating makes sense once the operational scale (traffic, team size, number of independently deployed services) actually justifies that cost, not before.

## Conceptual mapping

| This repo's concept                                      | Kubernetes equivalent                                                                                                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker-compose.yml` service (`api`, `web`, `admin`)     | A `Deployment` (one per service)                                                                                                                                          |
| `postgres`/`redis` services                              | Typically migrated to a managed service (RDS/Cloud SQL, ElastiCache/Memorystore) rather than run in-cluster, or a `StatefulSet` + `PersistentVolumeClaim` if self-hosting |
| `deploy.replicas` / `--scale api=N`                      | `Deployment.spec.replicas`, or a `HorizontalPodAutoscaler` for automatic scaling                                                                                          |
| Dockerfile `HEALTHCHECK`                                 | `livenessProbe` (liveness) and `readinessProbe` (readiness) — both already have a real endpoint to point at: `apps/api`'s `/health/live` and `/health/ready`              |
| `docker/nginx/nginx.conf` reverse proxy                  | An `Ingress` resource (with an ingress controller such as nginx-ingress or a cloud load balancer)                                                                         |
| `env_file:` / `.env.<environment>`                       | A `ConfigMap` (non-secret values) + a `Secret` (JWT secrets, `DATABASE_URL`)                                                                                              |
| `docker-compose.<env>.yml` overlay                       | A separate `Namespace` (or a Kustomize overlay) per environment                                                                                                           |
| `stackleo-postgres-data` / `stackleo-redis-data` volumes | `PersistentVolumeClaim`s, or removed entirely if the database is migrated to a managed service                                                                            |

## What would need to happen first

1. A real container registry (see `.github/workflows/cd.yml`'s placeholder push step) — Kubernetes pulls images from a registry, it doesn't build them.
2. A decision on managed vs. self-hosted Postgres/Redis — this changes whether `postgres`/`redis` migrate into the cluster at all.
3. TLS/certificate provisioning at the ingress layer (cert-manager is the common choice) — this repo's nginx config is HTTP-only today (see `environments.md`).
4. A secrets-management decision beyond checked-out `.env` files — see `docs/06_Security/secrets-management.md` and `docs/07_DevOps/secrets-management.md`.

None of the above is implemented here; this document only maps what exists today onto the concepts a migration would eventually use.
