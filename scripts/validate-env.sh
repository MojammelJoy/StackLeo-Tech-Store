#!/usr/bin/env bash
# scripts/validate-env.sh
#
# Verifies a target .env file defines every key a reference .env.example
# lists, so a missing variable is caught before a deploy rather than at
# runtime. apps/api's own env schema (apps/api/src/config/env.schema.ts)
# already validates *values* when the app starts; this catches *missing
# keys* earlier, in CI/CD or before running scripts/deploy.sh.
#
# Usage: bash scripts/validate-env.sh <reference.env.example> <target.env>
set -euo pipefail

reference_file="${1:-}"
target_file="${2:-}"

if [[ -z "$reference_file" || -z "$target_file" ]]; then
  echo "Usage: $0 <reference.env.example> <target.env>" >&2
  exit 1
fi

if [[ ! -f "$reference_file" ]]; then
  echo "Reference file not found: $reference_file" >&2
  exit 1
fi

if [[ ! -f "$target_file" ]]; then
  echo "Target file not found: $target_file" >&2
  exit 1
fi

missing=0
while IFS='=' read -r key _; do
  key="$(echo "$key" | xargs)"
  [[ -z "$key" || "$key" == \#* ]] && continue
  if ! grep -q "^${key}=" "$target_file"; then
    echo "Missing required variable: $key" >&2
    missing=1
  fi
done <"$reference_file"

if [[ "$missing" -eq 1 ]]; then
  echo "Environment validation FAILED for $target_file" >&2
  exit 1
fi

echo "Environment validation passed: $target_file defines every variable in $reference_file"
