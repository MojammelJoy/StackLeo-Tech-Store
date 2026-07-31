# Release Checklist

Verify every item before cutting a release (tagging a version and triggering `.github/workflows/cd.yml`).

## Before tagging

- [ ] `main` is green: the latest `.github/workflows/ci.yml` run (lint, typecheck, test, build) passed.
- [ ] Every change since the last release has been reviewed and merged through the normal PR process — no direct pushes to `main`.
- [ ] The changelog/release notes describe what's actually in this release, including any migration or environment-variable changes a deployer needs to know about.
- [ ] If this release includes a Prisma migration, it has been reviewed for whether it's safe to roll back (see `rollback-strategy.md`).

## Tagging

- [ ] Use a version tag matching `.github/workflows/cd.yml`'s trigger pattern (`v*`, e.g. `v1.4.0`) — semantic versioning: breaking change → major, new capability → minor, fix → patch.
- [ ] The tag points at the exact commit that passed CI, not a later or earlier one.

## After tagging

- [ ] The CD workflow's `build` job completes successfully (images build without error).
- [ ] Staging has been deployed and smoke-tested with this exact release before promoting to production (`workflow_dispatch` → `staging`, or `bash scripts/deploy.sh staging`).
- [ ] Production deployment follows `production-checklist.md` in full — a release checklist passing does not skip the production checklist.

## After release

- [ ] The deployment is monitored for a meaningful period afterward (see `docs/10_Monitoring_Observability/monitoring-configuration.md`) — a release isn't "done" the moment it deploys successfully.
- [ ] Anything learned from this release (an unexpected issue, a step that should have been automated) is captured somewhere the next release will actually see it.
