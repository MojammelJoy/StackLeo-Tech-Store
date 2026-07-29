# @stackleo/config

Shared ESLint, TypeScript, and Tailwind CSS configuration for StackLeo Tech Store.

## Purpose

Provides the single source of truth for tooling configuration consumed by every app and package, so linting, type-checking, and styling rules stay consistent across the monorepo instead of drifting per workspace.

## Structure

```text
packages/config/
├── eslint/
│   └── base.js          # Shared base ESLint flat config
├── typescript/
│   └── base.json         # Shared base tsconfig, extended by each workspace
├── tailwind/
│   └── base.js              # Shared base Tailwind config and design tokens
├── package.json
└── README.md
```

## Conventions

- Workspace-specific configuration files (e.g. `apps/web/eslint.config.js`) extend these base files rather than redefining rules from scratch.
- Any change here affects every consuming workspace — treat changes as a cross-team, reviewed decision.
