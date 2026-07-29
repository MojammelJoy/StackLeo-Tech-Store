# @stackleo/web

The customer-facing storefront for **StackLeo Tech Store**. Built with Next.js (App Router), React, TypeScript, and Tailwind CSS, consuming the shared `@stackleo/*` packages for UI, types, utilities, validation, and constants.

## Purpose

Serves the public shopping experience — browsing, search, product detail, cart, checkout, and account — for end customers.

## Structure

```text
apps/web/
├── src/
│   ├── app/          # Next.js App Router routes, layouts, and pages
│   ├── components/   # App-specific React components (not shared across apps)
│   ├── hooks/         # App-specific React hooks
│   ├── lib/            # App-specific client utilities (API clients, helpers)
│   ├── styles/           # Global styles and Tailwind entry point
│   └── types/               # App-specific TypeScript types
├── public/            # Static assets served as-is
├── package.json
├── tsconfig.json
├── .env.example
└── Dockerfile
```

## Conventions

- Shared, reusable UI belongs in `@stackleo/ui`, not `src/components`.
- Shared types belong in `@stackleo/types`; app-specific types stay in `src/types`.
- All environment variables consumed by the browser must be prefixed `NEXT_PUBLIC_`.

## Local Development

See [`docs/developer-guide.md`](../../docs/developer-guide.md) at the repository root.
