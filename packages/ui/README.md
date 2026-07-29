# @stackleo/ui

Shared, brand-consistent UI component library for StackLeo Tech Store, built on React, Tailwind CSS, and shadcn/ui primitives.

## Purpose

Provides the single source of truth for visual components reused across `apps/web` and `apps/admin` — buttons, forms, cards, navigation, and other design-system primitives. App-specific, non-reusable components stay in each app's own `src/components`.

## Structure

```text
packages/ui/
├── src/
│   ├── components/   # Shared component implementations
│   ├── hooks/         # Shared UI-related React hooks
│   └── styles/          # Shared style tokens / Tailwind extensions
├── package.json
├── tsconfig.json
└── README.md
```

## Conventions

- Every exported component must be genuinely reusable across more than one app; single-use components belong in the consuming app.
- Components consume design tokens from `packages/config/tailwind`, never hardcode brand values.
