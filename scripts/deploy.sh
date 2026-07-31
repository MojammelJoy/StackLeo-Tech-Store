#!/usr/bin/env bash
# scripts/deploy.sh
#
# Deployment orchestration template for the docker-compose-based
# self-hosted stack (docker-compose.yml + docker-compose.<env>.yml).
# Deliberately provider-agnostic — actual cloud-specific deployment
# (a Vercel/Render CLI call, a cloud provider API) is out of scope for
# this foundation; see docs/11_Deployment_DevOps/environments.md for
# where those would plug in instead of this script.
#
# Usage: bash scripts/deploy.sh <staging|production>
set -euo pipefail

environment="${1:-}"
if [[ "$environment" != "staging" && "$environment" != "production" ]]; then
  echo "Usage: $0 <staging|production>" >&2
  exit 1
fi

echo "Validating environment file for $environment ..."
bash scripts/validate-env.sh "apps/api/.env.example" "apps/api/.env.${environment}"

echo "Building images for $environment ..."
docker compose -f docker-compose.yml -f "docker-compose.${environment}.yml" build

echo "Starting the $environment stack ..."
docker compose -f docker-compose.yml -f "docker-compose.${environment}.yml" up -d

# Checked via the api container's own Docker HEALTHCHECK (baked into
# apps/api/Dockerfile's runner stage) rather than an HTTP request through
# nginx — docker/nginx/nginx.conf routes by subdomain (api.stackleo.example),
# which needs real DNS to resolve, unlike a container-status check.
# scripts/health-check.sh is the right tool instead once you're checking a
# deployment that isn't fronted by this compose stack's own nginx (e.g. a
# managed platform's public URL).
echo "Waiting for the API container to report healthy ..."
attempts=18
until [[ "$(docker inspect --format='{{.State.Health.Status}}' stackleo-api 2>/dev/null || echo unknown)" == "healthy" ]]; do
  attempts=$((attempts - 1))
  if ((attempts <= 0)); then
    echo "API container did not become healthy in time" >&2
    exit 1
  fi
  sleep 5
done

echo "Deployment to $environment complete."
