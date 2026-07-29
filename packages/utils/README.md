# @stackleo/utils

Shared, framework-agnostic utility functions for StackLeo Tech Store.

## Purpose

Provides pure, reusable helper functions (formatting, string/number manipulation, date handling, and similar cross-cutting logic) consumed by both frontend apps and the backend API.

## Structure

```text
packages/utils/
├── src/    # Utility function implementations, organized by concern
├── package.json
├── tsconfig.json
└── README.md
```

## Conventions

- Functions here must be pure and framework-agnostic — no React, no Express, no side effects tied to a specific runtime.
- Validation logic belongs in `@stackleo/validation`, not here.
