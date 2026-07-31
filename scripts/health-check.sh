#!/usr/bin/env bash
# scripts/health-check.sh
#
# Polls a health endpoint until it responds 2xx or a timeout elapses —
# the same kind of check a CD pipeline runs right after a deploy before
# declaring it successful (see scripts/deploy.sh). This checks a
# deployment from the outside, over HTTP; it is not the container-level
# Docker HEALTHCHECK baked into apps/*/Dockerfile.
#
# Usage: bash scripts/health-check.sh <url> [timeout_seconds] [interval_seconds]
set -euo pipefail

url="${1:-}"
timeout_seconds="${2:-60}"
interval_seconds="${3:-5}"

if [[ -z "$url" ]]; then
  echo "Usage: $0 <url> [timeout_seconds] [interval_seconds]" >&2
  exit 1
fi

elapsed=0
while ((elapsed < timeout_seconds)); do
  status="$(curl -s -o /dev/null -w '%{http_code}' "$url" || echo "000")"
  if [[ "$status" =~ ^2 ]]; then
    echo "Healthy: $url responded $status"
    exit 0
  fi
  echo "Waiting for $url to become healthy (last status: $status)..."
  sleep "$interval_seconds"
  elapsed=$((elapsed + interval_seconds))
done

echo "Health check FAILED: $url did not respond 2xx within ${timeout_seconds}s" >&2
exit 1
