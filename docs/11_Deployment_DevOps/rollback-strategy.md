# Rollback Strategy

How to reverse a bad deployment with this repository's tooling. The conceptual, vendor-neutral counterpart is `docs/07_DevOps/deployment-strategy.md`'s "Rollback Readiness" lifecycle stage; this document is the concrete execution of it.

## Application rollback

Every image this stack builds is tagged by the git commit it was built from (see `.github/workflows/cd.yml`'s `docker build ... -t stackleo-api:${{ github.sha }}`). Rolling back the application means redeploying the previous commit's image, not "undoing" a running container in place:

1. Identify the last known-good commit SHA (the previous successful CD run, or `git log`).
2. Rebuild and redeploy from that commit:
   ```bash
   git checkout <previous-good-sha>
   bash scripts/deploy.sh production
   ```
3. Confirm health via the same check `deploy.sh` itself runs — the `api` container's Docker `HEALTHCHECK` reporting `healthy` (`docker inspect --format='{{.State.Health.Status}}' stackleo-api`).
4. Investigate the failed deployment separately, on a branch — never debug directly against the rolled-back production environment.

This works because every environment overlay (`docker-compose.staging.yml`, `docker-compose.production.yml`) builds from source rather than pulling a pre-built image by default; if you introduce a container registry (see `cd.yml`'s placeholder push step), rolling back becomes "redeploy the previous tag" instead of "rebuild from the previous commit" — faster, but requires that registry to exist first.

## Database rollback

Schema changes in this codebase are managed by Prisma migrations (`apps/api/prisma/`). Rolling back a deployment that included a migration is riskier than rolling back application code alone — decide which of these applies _before_ you need it, not during an incident:

- **No destructive migration involved** — redeploying the previous application image is sufficient; the previous code doesn't reference whatever the new migration added.
- **A destructive or backward-incompatible migration was involved** (a dropped column, a changed constraint) — restore the most recent backup from before the migration ran:
  ```bash
  DATABASE_URL=postgresql://stackleo:stackleo@localhost:5432/stackleo_production \
    bash scripts/restore-db.sh ./backups/stackleo-<timestamp>.sql.gz
  ```
  `restore-db.sh` prompts for confirmation before overwriting anything — read the prompt; this is destructive to whatever data was written since that backup was taken.

## Rollback readiness checklist

- [ ] A recent backup exists and its restorability has been verified (see `backup-strategy.md`).
- [ ] The previous commit/image that was known-good is identified before starting the new deployment, not searched for during an incident.
- [ ] Whoever is deploying knows which of the two database-rollback cases above applies, before deploying.
