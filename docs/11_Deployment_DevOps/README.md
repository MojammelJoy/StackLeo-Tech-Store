# 11_Deployment_DevOps

Concrete, actionable deployment documentation for StackLeo Tech Store — the hands-on companion to [`docs/07_DevOps`](../07_DevOps)'s vendor-neutral governance and strategy documents. Where `07_DevOps/deployment-strategy.md` defines deployment philosophy independent of any specific platform, the documents here describe _this repository's actual_ Dockerfiles, Compose files, scripts, and CI/CD workflows, and how to use them.

## Contents

| Document                                                             | Purpose                                                                                                                 |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [`environments.md`](./environments.md)                               | How local development, staging, and production are each configured and started, and what actually differs between them. |
| [`backup-strategy.md`](./backup-strategy.md)                         | What gets backed up, how often, and how to run a backup or restore.                                                     |
| [`rollback-strategy.md`](./rollback-strategy.md)                     | How to reverse a bad deployment — application rollback and database rollback.                                           |
| [`production-checklist.md`](./production-checklist.md)               | What to verify before a production deployment.                                                                          |
| [`release-checklist.md`](./release-checklist.md)                     | What to verify before cutting a release.                                                                                |
| [`future-kubernetes-migration.md`](./future-kubernetes-migration.md) | How today's Compose services would map onto Kubernetes — conceptual only, no manifests.                                 |

## Related infrastructure

- `docker-compose.yml` + `docker-compose.override.yml` / `docker-compose.staging.yml` / `docker-compose.production.yml` (repo root)
- `apps/api/Dockerfile`, `apps/web/Dockerfile`, `apps/admin/Dockerfile`
- `docker/nginx/nginx.conf`, `docker/prometheus/prometheus.yml.example`
- `scripts/validate-env.sh`, `scripts/health-check.sh`, `scripts/backup-db.sh`, `scripts/restore-db.sh`, `scripts/deploy.sh`
- `.github/workflows/ci.yml`, `.github/workflows/cd.yml`

## Scope

This category and its documents describe deployment **infrastructure and process** — how to build, run, and operate what already exists. They do not define application logic, business behavior, or infrastructure-as-code for a specific cloud provider; see this folder's own documents for what's explicitly out of scope, and `docs/07_DevOps` for the governance principles this infrastructure is built to satisfy.
