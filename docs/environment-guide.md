# Environment Guide

Full environment variable reference for **StackLeo Tech Store**, across the root and every app. Never commit a real `.env` file — only `.env.example` files are tracked in version control.

## File Locations

| File | Scope |
|---|---|
| `.env.example` (root) | Shared, cross-cutting variables referenced across multiple apps |
| `apps/web/.env.example` | Storefront-specific variables |
| `apps/admin/.env.example` | Admin dashboard-specific variables |
| `apps/api/.env.example` | API-specific variables |

## Root Variables

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) |
| `DATABASE_URL` | PostgreSQL connection string, consumed by `apps/api` via Prisma |
| `REDIS_URL` | Redis connection string, consumed by `apps/api` |
| `API_BASE_URL` | Canonical URL of the deployed API, for cross-service reference |
| `WEB_BASE_URL` | Canonical URL of the deployed storefront |
| `ADMIN_BASE_URL` | Canonical URL of the deployed admin dashboard |

## `apps/web` Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | API endpoint the storefront calls from the browser |
| `NEXT_PUBLIC_SITE_NAME` | Displayed site name |
| `NEXT_PUBLIC_SITE_TAGLINE` | Displayed tagline ("Everything Tech, One Marketplace.") |

## `apps/admin` Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | API endpoint the admin dashboard calls from the browser |
| `NEXT_PUBLIC_ADMIN_SITE_NAME` | Displayed admin site name |

## `apps/api` Variables

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Runtime environment |
| `PORT` | Port the Express server listens on |
| `DATABASE_URL` | PostgreSQL connection string (Prisma datasource) |
| `REDIS_URL` | Redis connection string |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of origins permitted to call the API (`apps/web`, `apps/admin`) |

## Conventions

- Any variable exposed to the browser **must** be prefixed `NEXT_PUBLIC_`; anything without that prefix is assumed server-only and must never be referenced from client components.
- Every new variable added to an app must be added to that app's `.env.example` **and** to this document in the same change.
- Secrets (API keys, credentials) are never committed, even as example values — use obviously placeholder text (e.g. `user:password`) in `.env.example` files.

## Related Documents

- [`developer-guide.md`](./developer-guide.md) — local setup steps referencing these files.
- [`repository-overview.md`](./repository-overview.md) — where each `.env.example` file lives in the tree.
