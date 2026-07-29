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
