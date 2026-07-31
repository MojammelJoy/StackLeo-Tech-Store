# scripts/

Repository automation and tooling scripts for StackLeo Tech Store.

## Purpose

Holds cross-cutting automation that operates at the repository level — setup scripts, release tooling, workspace maintenance, and CI helper scripts — rather than logic belonging to any single app or package.

## Scripts

| Script                                 | Purpose                                                                                                                                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`validate-env.sh`](./validate-env.sh) | Checks a target `.env` file defines every key a reference `.env.example` lists — catches a missing variable before deploy rather than at runtime.                                                                       |
| [`health-check.sh`](./health-check.sh) | Polls an HTTP endpoint until it responds 2xx or a timeout elapses — for verifying a deployment from the outside, over HTTP.                                                                                             |
| [`backup-db.sh`](./backup-db.sh)       | Dumps the Postgres database at `$DATABASE_URL` to a timestamped, compressed archive. See [`docs/11_Deployment_DevOps/backup-strategy.md`](../docs/11_Deployment_DevOps/backup-strategy.md).                             |
| [`restore-db.sh`](./restore-db.sh)     | Restores a backup produced by `backup-db.sh`. Destructive — confirms before overwriting. See [`docs/11_Deployment_DevOps/rollback-strategy.md`](../docs/11_Deployment_DevOps/rollback-strategy.md).                     |
| [`deploy.sh`](./deploy.sh)             | Orchestrates `docker compose build`/`up` against a staging or production overlay, validating env and waiting for the API container to report healthy. Deliberately provider-agnostic — see the script's header comment. |

Run any of these with `bash scripts/<name>.sh` (no need to `chmod +x` first, though doing so lets you invoke them directly as `./scripts/<name>.sh`).

## Conventions

- A script here must be genuinely repository-wide; logic specific to one app belongs in that app's own `package.json` scripts instead.
- Every script starts with a comment explaining what it does, when it's invoked (locally, in CI, or both), and what it depends on.
- Every script uses `set -euo pipefail` and validates its own arguments before doing anything destructive.
