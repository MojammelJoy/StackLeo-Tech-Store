# @stackleo/admin

The internal operations and merchandising dashboard for **StackLeo Tech Store**. Built with Next.js (App Router), React, TypeScript, and Tailwind CSS, consuming the shared `@stackleo/*` packages.

## Purpose

Serves internal StackLeo staff — catalog management, order operations, customer support tooling, and reporting. Not exposed to end customers.

## Structure

```text
apps/admin/
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
- Access control and authentication for internal staff is governed at the API layer; the admin app never trusts client-side role checks alone.

## Local Development

See [`docs/developer-guide.md`](../../docs/developer-guide.md) at the repository root.
