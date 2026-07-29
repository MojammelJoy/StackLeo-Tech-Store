# @stackleo/types

Shared TypeScript types and interfaces for StackLeo Tech Store.

## Purpose

Provides the single source of truth for types shared across `apps/*` and `packages/*` — domain entities, API request/response contracts, and cross-cutting shape definitions. Prevents type drift between the API and its consumers.

## Structure

```text
packages/types/
├── src/    # Type & interface definitions, organized by domain
├── package.json
├── tsconfig.json
└── README.md
```

## Conventions

- Types here describe shape only — no runtime logic and no validation. Runtime validation of these shapes belongs in `@stackleo/validation`.
- Organize by domain (e.g. `product`, `order`, `user`), not by technical layer.
