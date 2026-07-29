# @stackleo/validation

Shared Zod validation schemas for StackLeo Tech Store.

## Purpose

Provides the single source of truth for runtime validation of shapes defined in `@stackleo/types` — request payloads, form input, and any data crossing a trust boundary. Consumed by `apps/api` (server-side validation) and frontend apps (form validation) alike, so validation rules never drift between client and server.

## Structure

```text
packages/validation/
├── src/    # Zod schema definitions, organized by domain
├── package.json
├── tsconfig.json
└── README.md
```

## Conventions

- Every schema here should correspond to a type in `@stackleo/types`; infer the type from the schema (`z.infer<...>`) rather than maintaining both by hand where possible.
- Organize by domain (e.g. `product`, `order`, `user`), mirroring `@stackleo/types`.
