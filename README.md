# StackLeo Tech Store

**Everything Tech, One Marketplace.**

## Project Overview

StackLeo Tech Store is the enterprise monorepo for StackLeo's e-commerce platform — engineered to scale to millions of users and support multiple, independent engineering teams working in parallel. The repository separates application code, shared packages, infrastructure, documentation, and automation into clearly bounded top-level directories.

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, Redis |
| Shared | TypeScript, Zod, ESLint, Prettier |
| Deployment | Docker, GitHub Actions, Vercel, Render |

---

## Repository Structure

```text
stackleo-tech-store/
├── apps/               # Deployable applications
│   ├── web/              # Customer-facing storefront (Next.js)
│   ├── admin/              # Internal admin dashboard (Next.js)
│   └── api/                  # Backend REST API (Express + Prisma)
├── packages/            # Shared, internally-consumed code
│   ├── ui/                 # Shared design system / component library
│   ├── types/                # Shared TypeScript types & interfaces
│   ├── config/                  # Shared ESLint / TypeScript / Tailwind config
│   ├── utils/                      # Shared pure utility functions
│   ├── validation/                    # Shared Zod schemas
│   └── constants/                        # Shared enums & constant values
├── docs/                # ALL documentation (see Documentation Location below)
├── docker/               # Shared local infrastructure orchestration (Postgres, Redis)
├── scripts/                # Repository automation & tooling scripts
├── .github/                  # CI/CD workflows, issue & PR templates
├── .vscode/                    # Shared editor configuration
├── .env.example                  # Shared, cross-cutting environment variables
├── .gitignore
├── docker-compose.yml               # Local development orchestration
├── package.json                       # Root workspace manifest
├── tsconfig.json                        # Base TypeScript configuration
├── eslint.config.js                       # Base ESLint configuration
├── prettier.config.js                       # Base Prettier configuration
├── LICENSE
└── README.md                                  # This file
```

The repository root contains **only**: `apps/`, `packages/`, `docker/`, `scripts/`, `.github/`, `.vscode/`, `docs/`, and the minimal set of root configuration files listed above. Every other document lives under `docs/`.

## Documentation Location

**All documentation lives in [`docs/`](./docs).** Nothing else at the repository root holds documentation content.

`docs/` contains:

- **20 numbered governance & domain categories** (`00_Project_Overview/` through `19_Service_Management_Governance/`) — business, product, architecture, database, API, security, DevOps, QA, and operations documentation, plus ten categories reserved for future enterprise governance expansion.
- **Development documentation** — `repository-overview.md`, `architecture-overview.md`, `developer-guide.md`, `contribution-guide.md`, `environment-guide.md`.
- **Navigation indexes** — `MASTER_INDEX.md`, `DOCUMENT_MAP.md`, `DOCUMENT_TRACEABILITY_MATRIX.md`, `DOCUMENTATION_ROADMAP.md`.
- **`assets/`** — `diagrams/`, `images/`, and `screenshots/` referenced by documentation.

Start at **[`docs/README.md`](./docs/README.md)** for the full documentation index.

---

## Development Quick Start

1. Install Node.js 20+ and npm 10+.
2. Install dependencies from the repository root: `npm install`.
3. Copy each `.env.example` file (root, plus each of `apps/web`, `apps/admin`, `apps/api`) to `.env` and populate values.
4. Start shared infrastructure: `docker compose up postgres redis`.
5. Run the application(s) you need from their respective workspace, e.g. `npm run dev -w apps/web`.

Full setup and workflow details: [`docs/developer-guide.md`](./docs/developer-guide.md) and [`docs/environment-guide.md`](./docs/environment-guide.md).

### Applications

| App | Path | Purpose |
|---|---|---|
| Web | `apps/web` | Customer-facing storefront |
| Admin | `apps/admin` | Internal operations & merchandising dashboard |
| API | `apps/api` | Backend REST API serving both `web` and `admin` |

### Shared Packages

| Package | Path | Purpose |
|---|---|---|
| `@stackleo/ui` | `packages/ui` | Shared, brand-consistent UI component library |
| `@stackleo/types` | `packages/types` | Shared TypeScript types and interfaces |
| `@stackleo/config` | `packages/config` | Shared ESLint, TypeScript, and Tailwind configuration |
| `@stackleo/utils` | `packages/utils` | Shared, framework-agnostic utility functions |
| `@stackleo/validation` | `packages/validation` | Shared Zod validation schemas |
| `@stackleo/constants` | `packages/constants` | Shared enums and constant values |

---

## Documentation Quick Links

| Document | Purpose |
|---|---|
| [`docs/README.md`](./docs/README.md) | Full documentation index, folder descriptions, and reading order |
| [`docs/MASTER_INDEX.md`](./docs/MASTER_INDEX.md) | Every documentation category, its status, and document count |
| [`docs/repository-overview.md`](./docs/repository-overview.md) | Complete repository folder tree and purpose of every file |
| [`docs/architecture-overview.md`](./docs/architecture-overview.md) | High-level system and monorepo architecture |
| [`docs/developer-guide.md`](./docs/developer-guide.md) | Local setup, standards, and conventions |
| [`docs/contribution-guide.md`](./docs/contribution-guide.md) | Contribution standards, branching, and review process |
| [`docs/environment-guide.md`](./docs/environment-guide.md) | Environment variables and configuration per app |

## Contributing

See [`docs/contribution-guide.md`](./docs/contribution-guide.md) and [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md) before opening a pull request.

## License

Proprietary — see [`LICENSE`](./LICENSE).

---

© StackLeo. All Rights Reserved.
