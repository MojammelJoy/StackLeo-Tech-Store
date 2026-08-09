# @stackleo/api

The backend REST API for **StackLeo Tech Store**. Built with Node.js, Express, TypeScript, Prisma, PostgreSQL, and Redis. Serves both `apps/web` and `apps/admin`.

## Purpose

Owns all business logic, data persistence, and integration with shared infrastructure. Frontend applications never access the database directly — every read and write passes through this API.

## Structure

```text
apps/api/
├── src/
│   ├── routes/         # Express route definitions, grouped by resource
│   ├── controllers/     # Request/response handling per route
│   ├── services/          # Business logic, orchestration
│   ├── middleware/           # Auth, validation, error handling, logging
│   ├── config/                  # App configuration & environment loading
│   ├── utils/                     # API-specific utility functions
│   ├── types/                       # API-specific TypeScript types
│   └── jobs/                          # Background/scheduled job definitions
├── prisma/
│   └── schema.prisma    # Prisma data model & datasource definition
├── package.json
├── tsconfig.json
├── .env.example
└── Dockerfile
```

## Conventions

- **Layering**: `routes` → `controllers` → `services`. Controllers stay thin; business logic lives in `services`.
- **Validation**: incoming request payloads are validated using schemas from `@stackleo/validation` (Zod).
- **Shared types**: request/response contracts consumed by frontend apps are defined in `@stackleo/types`, not duplicated locally.
- **Database access**: only `services` interact with Prisma; controllers never import `@prisma/client` directly.

## Local Development

See [`docs/developer-guide.md`](../../docs/developer-guide.md) at the repository root.

## Testing

`pnpm test` (from this directory or the repo root) runs both suites together:

- **Unit tests** (`*.test.ts`) — mocked Prisma/repositories, no database required.
- **Integration tests** (`*.integration.test.ts`, see `src/testing/integration/` and `src/integration/`) — boot the real Express app and exercise it over real HTTP against a real Postgres database. CI provisions this automatically (see `.github/workflows/ci.yml`); for local runs, create the database once:

```bash
# 1. Create a dedicated test role + database (once, on your local Postgres)
psql -U postgres -c "CREATE ROLE test WITH LOGIN PASSWORD 'test' CREATEDB;"
psql -U postgres -c "CREATE DATABASE stackleo_test OWNER test;"

# 2. Apply migrations to it (never your dev database)
DATABASE_URL="postgresql://test:test@localhost:5432/stackleo_test" pnpm prisma migrate deploy

# 3. Run the tests
pnpm test                # both suites together (matches CI)
pnpm test:unit            # unit only, no database needed
pnpm test:integration     # integration only
```

The exact URL (`postgresql://test:test@localhost:5432/stackleo_test`) is fixed by `src/testing/constants/test-env.constants.ts` and applied to every test worker by `vitest.config.ts` — it always targets this dedicated database, never your local dev database (`.env`'s `DATABASE_URL`).
