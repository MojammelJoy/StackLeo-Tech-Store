# Contribution Guide

Standards and process for contributing to **StackLeo Tech Store**. Read [`developer-guide.md`](./developer-guide.md) first for local setup and conventions.

## Branching Strategy

- `main` is always deployable. Nothing is committed directly to `main`.
- Feature branches follow `<type>/<short-description>`, where `<type>` is one of: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`.
- Branch from the latest `main`; rebase rather than merge `main` into a long-running branch where practical.

## Commit Standards

- Commits should be small, coherent, and independently understandable.
- Prefer [Conventional Commits](https://www.conventionalcommits.org/) style (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`) so history stays scannable as the number of contributors grows.
- A commit message explains *why*, not just *what* — the diff already shows what changed.

## Pull Request Process

1. Open a PR against `main` using [`.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md).
2. Keep PRs scoped to a single app/package where possible; cross-cutting changes to `packages/*` should call out every consuming app affected.
3. Ensure lint, typecheck, and tests pass locally before requesting review (see [`developer-guide.md`](./developer-guide.md) for commands).
4. At least one review approval is required before merge.
5. Squash-merge into `main` once approved, so `main` history stays one entry per change.

## Code Review Standards

- Reviewers verify the change respects the architecture principles in [`architecture-overview.md`](./architecture-overview.md) — no cross-app imports, no package reaching into `apps/*`, no workspace bypassing `packages/config`.
- Reviewers verify naming, import, and file organization conventions from [`developer-guide.md`](./developer-guide.md) are followed.
- Reviewers check that any new environment variable is documented in the relevant `.env.example` and in [`environment-guide.md`](./environment-guide.md).

## Adding a New App or Package

- A new **app** is added under `apps/` only when it represents a genuinely independent, deployable unit (see [`architecture-overview.md`](./architecture-overview.md#future-expansion-strategy)).
- A new **package** is added under `packages/` only once at least two apps or packages genuinely need the shared code — not speculatively.
- Either addition must include: `package.json`, `tsconfig.json` (extending the root config), a `README.md` describing its purpose and structure, and an entry added to [`repository-overview.md`](./repository-overview.md).

## Reporting Issues

Use [`.github/ISSUE_TEMPLATE/bug_report.md`](../.github/ISSUE_TEMPLATE/bug_report.md) or [`.github/ISSUE_TEMPLATE/feature_request.md`](../.github/ISSUE_TEMPLATE/feature_request.md) as appropriate.

## Related Documents

- [`developer-guide.md`](./developer-guide.md) — local setup, standards, naming and import conventions.
- [`architecture-overview.md`](./architecture-overview.md) — architectural principles a reviewer checks against.
- [`environment-guide.md`](./environment-guide.md) — environment variable reference.
