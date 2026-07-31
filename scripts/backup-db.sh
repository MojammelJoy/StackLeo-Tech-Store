#!/usr/bin/env bash
# scripts/backup-db.sh
#
# Dumps the Postgres database at $DATABASE_URL to a timestamped,
# compressed archive — the reference implementation of
# docs/11_Deployment_DevOps/backup-strategy.md. Requires the `pg_dump`
# client to be available on PATH (already present in the postgres:16-alpine
# image; install postgresql-client locally to run this outside Docker).
#
# Usage: DATABASE_URL=postgresql://... bash scripts/backup-db.sh [output_dir]
set -euo pipefail

output_dir="${1:-./backups}"
: "${DATABASE_URL:?DATABASE_URL must be set}"

mkdir -p "$output_dir"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
output_file="${output_dir}/stackleo-${timestamp}.sql.gz"

echo "Backing up database to $output_file ..."
pg_dump --no-owner --no-privileges "$DATABASE_URL" | gzip >"$output_file"
echo "Backup complete: $output_file"
