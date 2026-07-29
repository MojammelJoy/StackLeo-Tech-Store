# Developer Guide

Day-to-day workflow, standards, and conventions for working in the **StackLeo Tech Store** monorepo.

## Local Setup

1. Install Node.js 20+ and npm 10+.
2. Clone the repository and install dependencies from the root: `npm install`.
3. Copy every `.env.example` to `.env` (root, plus each of `apps/web`, `apps/admin`, `apps/api`) and populate values. See [`environment-guide.md`](./environment-guide.md).
4. Start shared infrastructure: `docker compose up postgres redis`.
5. Run whichever app(s) you're working on from their workspace, e.g. `npm run dev -w apps/web`.

## Repository Standards

- **TypeScript everywhere.** No plain JavaScript source files in `apps/*` or `packages/*`.
- **Strict typing.** The root `tsconfig.json` enables `strict` mode; workspace configs extend it rather than loosening it.
- **Validate at the boundary.** Any data crossing a trust boundary (API request body, form input) is validated with a `@stackleo/validation` schema before use.
- **Lint and format are non-negotiable gates.** `npm run lint` and `npm run format` must pass before a change is merged.
- **Every workspace is self-documenting.** A new contributor should be able to understand a workspace's purpose from its own `README.md` without reading the entire monorepo.
- **No cross-app imports.** `apps/web` and `apps/admin` never import from each other; shared logic is promoted to `packages/`.
- **The API owns the database.** Only `apps/api` imports `@prisma/client`; no other workspace connects to PostgreSQL directly.

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Workspace package name | `@stackleo/<name>`, kebab-case | `@stackleo/validation` |
| Folders | kebab-case | `src/components`, `product-card/` |
| React component files | PascalCase | `ProductCard.tsx` |
| Non-component TypeScript files | camelCase | `formatCurrency.ts` |
| React hooks | camelCase, `use` prefix | `useCart.ts` |
| Types & interfaces | PascalCase | `Product`, `OrderStatus` |
| Constants | SCREAMING_SNAKE_CASE for primitive constants; PascalCase for `as const` maps | `MAX_CART_ITEMS`, `OrderStatus` |
| Zod schemas | camelCase, `Schema` suffix | `productSchema` |
| Environment variables | SCREAMING_SNAKE_CASE; `NEXT_PUBLIC_` prefix only when browser-exposed | `DATABASE_URL`, `NEXT_PUBLIC_API_BASE_URL` |
| Branches | `<type>/<short-description>` | `feat/product-search`, `fix/cart-total` |

## Import Conventions

- **Internal package imports use the `@stackleo/*` alias**, never relative paths that cross a workspace boundary (e.g. `import { productSchema } from "@stackleo/validation"`, never `../../../packages/validation/src`).
- **Within an app, use the `@/*` alias** for `src/`-relative imports (e.g. `import { Header } from "@/components/Header"`), never long relative chains (`../../../components/Header`).
- **Import order**: external packages first, then `@stackleo/*` internal packages, then `@/*` local imports, then relative imports — each group separated by a blank line.
- **No deep imports into another workspace's internals.** Import only from a package's declared entry point (`@stackleo/ui`, not `@stackleo/ui/src/components/Button/internal`).

## File Organization Rules

- **Organize by feature/domain first, technical role second**, once a folder grows large enough to warrant it (e.g. `src/components/product/`, `src/components/checkout/`), rather than one flat folder of unrelated files.
- **Colocate what changes together.** A component's tests and styles specific to it live beside it, not in a distant mirrored tree.
- **Shared code graduates deliberately.** Code is not moved into `packages/` speculatively — it moves once a second app or package genuinely needs it.
- **`.gitkeep` marks intentionally empty scaffold folders** and is removed the moment real content is added.
- **Every workspace root stays flat and predictable**: `src/`, `package.json`, `tsconfig.json`, `README.md`, plus workspace-specific files (`.env.example`, `Dockerfile`, `prisma/`) — no ad hoc top-level folders added without updating [`repository-overview.md`](./repository-overview.md).

## Common Workflows

| Task | Command |
|---|---|
| Install all dependencies | `npm install` (from root) |
| Run a single app in dev mode | `npm run dev -w apps/web` |
| Lint the whole repo | `npm run lint` |
| Format the whole repo | `npm run format:fix` |
| Generate the Prisma client | `npm run prisma:generate -w apps/api` |
| Run a new migration | `npm run prisma:migrate -w apps/api` |
| Bring up local infrastructure | `docker compose up postgres redis` |

## Related Documents

- [`repository-overview.md`](./repository-overview.md) — complete folder tree and file purposes.
- [`architecture-overview.md`](./architecture-overview.md) — how the system fits together and scales.
- [`contribution-guide.md`](./contribution-guide.md) — branching, review, and contribution process.
- [`environment-guide.md`](./environment-guide.md) — full environment variable reference.
