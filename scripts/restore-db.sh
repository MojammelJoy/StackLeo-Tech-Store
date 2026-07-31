#!/usr/bin/env bash
# scripts/restore-db.sh
#
# Restores a backup produced by scripts/backup-db.sh into the Postgres
# database at $DATABASE_URL. Destructive — always confirm DATABASE_URL
# points at the intended database before running this. Reference
# implementation of docs/11_Deployment_DevOps/rollback-strategy.md's
# database-rollback step.
#
# Usage: DATABASE_URL=postgresql://... bash scripts/restore-db.sh <backup_file.sql.gz>
set -euo pipefail

backup_file="${1:-}"
: "${DATABASE_URL:?DATABASE_URL must be set}"

if [[ -z "$backup_file" ]]; then
  echo "Usage: DATABASE_URL=... $0 <backup_file.sql.gz>" >&2
  exit 1
fi

if [[ ! -f "$backup_file" ]]; then
  echo "Backup file not found: $backup_file" >&2
  exit 1
fi

read -r -p "This will overwrite the database at the configured DATABASE_URL. Continue? [y/N] " confirmation
if [[ "$confirmation" != "y" && "$confirmation" != "Y" ]]; then
  echo "Aborted."
  exit 1
fi

echo "Restoring $backup_file ..."
gunzip -c "$backup_file" | psql "$DATABASE_URL"
echo "Restore complete."
