# @stackleo/constants

Shared enums and constant values for StackLeo Tech Store.

## Purpose

Provides the single source of truth for fixed values shared across the monorepo — status enums, role names, limits, and similar constants — so the same value is never redefined independently in multiple apps.

## Structure

```text
packages/constants/
├── src/    # Constant & enum definitions, organized by domain
├── package.json
├── tsconfig.json
└── README.md
```

## Conventions

- A value used by more than one app or package belongs here, not duplicated locally.
- Prefer `as const` object maps or TypeScript enums over magic strings/numbers scattered through consuming code.
