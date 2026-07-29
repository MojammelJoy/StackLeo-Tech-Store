# Repository Overview

This document is the authoritative reference for the **StackLeo Tech Store** monorepo's structure — the purpose of every folder and every important file. It complements, and does not repeat, [`architecture-overview.md`](./architecture-overview.md) (system design), [`developer-guide.md`](./developer-guide.md) (day-to-day workflow and conventions), and [`environment-guide.md`](./environment-guide.md) (environment variables).

## Complete Folder Tree

```text
stackleo-tech-store/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/            # Next.js App Router routes, layouts, pages
│   │   │   ├── components/     # App-specific React components
│   │   │   ├── hooks/          # App-specific React hooks
│   │   │   ├── lib/            # App-specific client utilities
│   │   │   ├── styles/         # Global styles, Tailwind entry point
│   │   │   └── types/          # App-specific TypeScript types
│   │   ├── public/             # Static assets
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   └── README.md
│   ├── admin/
│   │   ├── src/                # Same shape as apps/web/src
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   └── README.md
│   └── api/
│       ├── src/
│       │   ├── routes/         # Express route definitions
│       │   ├── controllers/    # Request/response handling
│       │   ├── services/       # Business logic
│       │   ├── middleware/     # Auth, validation, error handling
│       │   ├── config/         # Configuration & environment loading
│       │   ├── utils/          # API-specific utility functions
│       │   ├── types/          # API-specific TypeScript types
│       │   └── jobs/           # Background/scheduled jobs
│       ├── prisma/
│       │   └── schema.prisma   # Prisma data model & datasource
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env.example
│       ├── Dockerfile
│       └── README.md
│
├── packages/
│   ├── ui/
│   │   ├── src/{components,hooks,styles}/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   ├── types/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   ├── config/
│   │   ├── eslint/base.js
│   │   ├── typescript/base.json
│   │   ├── tailwind/base.js
│   │   ├── package.json
│   │   └── README.md
│   ├── utils/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   ├── validation/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   └── constants/
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── docs/
│   ├── 00_Project_Overview/ … 09_Operations/   # Populated governance & domain categories
│   ├── 10_Monitoring_Observability/ … 19_Service_Management_Governance/  # Planned categories
│   ├── assets/{diagrams,images,screenshots}/   # Diagram, image, and screenshot assets
│   ├── README.md                    # Documentation index
│   ├── MASTER_INDEX.md              # Category status & document counts
│   ├── DOCUMENT_MAP.md              # Full per-document listing
│   ├── DOCUMENT_TRACEABILITY_MATRIX.md  # Cross-category dependency structure
│   ├── DOCUMENTATION_ROADMAP.md     # Plan for populating categories 10–19
│   ├── repository-overview.md       # This document
│   ├── architecture-overview.md     # System & monorepo architecture
│   ├── developer-guide.md           # Local setup, workflow, conventions
│   ├── contribution-guide.md        # Contribution standards & process
│   └── environment-guide.md         # Environment variable reference
│
├── docker/
│   ├── postgres/                    # PostgreSQL config overrides (placeholder)
│   ├── redis/                       # Redis config overrides (placeholder)
│   └── README.md
│
├── scripts/
│   ├── README.md
│   └── .gitkeep
│
├── .github/
│   ├── workflows/
│   │   └── ci.yml                   # CI pipeline (placeholder)
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .vscode/
│   ├── settings.json                # Shared editor settings
│   └── extensions.json              # Recommended extensions
│
├── package.json                     # Root workspace manifest
├── tsconfig.json                    # Base TypeScript configuration
├── eslint.config.js                 # Base ESLint configuration
├── prettier.config.js               # Base Prettier configuration
├── docker-compose.yml               # Local development orchestration
├── .env.example                     # Shared, cross-cutting env vars
├── .gitignore
├── LICENSE
└── README.md                        # Repository entry point
```

## Purpose of Every Top-Level Folder

| Folder | Purpose |
|---|---|
| `apps/` | Deployable applications — each one is independently buildable, deployable, and versioned. |
| `packages/` | Shared code consumed by two or more apps. Nothing here is independently deployable. |
| `docs/` | All documentation for the repository — governance & domain categories (`00_Project_Overview/`–`19_Service_Management_Governance/`), development guides, navigation indexes, and assets. See [`docs/README.md`](./README.md) for the full breakdown. |
| `docker/` | Shared local-development infrastructure (not app-specific containers, which live with their app). |
| `scripts/` | Repository-wide automation, distinct from any single app's own scripts. |
| `.github/` | CI/CD workflow definitions and GitHub-native process templates. |
| `.vscode/` | Shared editor configuration so every contributor gets consistent tooling defaults. |

## Purpose of Important Root Files

| File | Purpose |
|---|---|
| `package.json` | Declares the npm workspaces (`apps/*`, `packages/*`) and repository-wide scripts. |
| `tsconfig.json` | Base TypeScript compiler configuration and shared path aliases (`@stackleo/*`), extended by every workspace. |
| `eslint.config.js` | Base ESLint flat config; workspace-specific configs extend it. |
| `prettier.config.js` | Base formatting rules applied uniformly across the repository. |
| `docker-compose.yml` | Brings up PostgreSQL, Redis, and all three apps together for local development. |
| `.env.example` | Documents shared, cross-cutting environment variables only — each app has its own `.env.example` for app-specific variables. |
| `.gitignore` | Excludes build artifacts, dependencies, and secrets from version control. |
| `LICENSE` | Proprietary license terms governing this codebase. |
| `README.md` | The repository's entry point — quick orientation and links into `docs/`. |

## Purpose of Important Per-Workspace Files

| File Pattern | Purpose |
|---|---|
| `apps/*/package.json`, `packages/*/package.json` | Declares the workspace's name (`@stackleo/*`), dependencies, and scripts. Every internal cross-workspace dependency is declared explicitly, never assumed. |
| `apps/*/tsconfig.json`, `packages/*/tsconfig.json` | Extends the root `tsconfig.json`; adds workspace-specific compiler options (e.g. `jsx` for frontend apps). |
| `apps/*/.env.example` | Documents every environment variable that specific app consumes. |
| `apps/*/Dockerfile` | Defines how that specific app is containerized for deployment. |
| `apps/api/prisma/schema.prisma` | The single source of truth for the database schema, consumed only by `apps/api`. |
| `apps/*/README.md`, `packages/*/README.md` | Documents that workspace's purpose, structure, and conventions in isolation, so a contributor can understand it without reading the whole monorepo. |

## Related Documents

- [`architecture-overview.md`](./architecture-overview.md) — how these pieces fit together as a system, and how the structure scales.
- [`developer-guide.md`](./developer-guide.md) — standards, naming conventions, import conventions, and file organization rules.
- [`contribution-guide.md`](./contribution-guide.md) — how to propose and land a change.
- [`environment-guide.md`](./environment-guide.md) — full environment variable reference per app.
