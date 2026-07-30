// StackLeo Tech Store — lint-staged configuration.
// Runs only the checks relevant to each staged file's type, scoped to the
// files actually staged rather than the whole repository.
//
// ESLint's flat config has no directory-based cascading (unlike the old
// eslintrc format): a single `eslint` run resolves exactly ONE config
// file, found by searching upward from the *process* cwd — it does not
// pick a different config per linted file. Git hooks run lint-staged
// from the repo root, so a bare `eslint --fix <file>` always resolves to
// the root eslint.config.js, which deliberately ignores `apps/**` and
// `packages/**` (see that file's header comment — each workspace lints
// its own source via its own eslint.config.js). Without `--config`,
// ESLint treats every staged workspace file as ignored and reports
// "No files matching the pattern ... were found". Each workspace glob
// below passes its own eslint.config.js explicitly so the correct rules
// apply regardless of where the hook is invoked from.

/** @type {import('lint-staged').Config} */
const workspaceEslintConfigs = {
  "apps/admin/**/*.{ts,tsx,js,jsx,mjs,cjs}": [
    "eslint --fix --config apps/admin/eslint.config.js",
    "prettier --write",
  ],
  "apps/api/**/*.{ts,tsx,js,jsx,mjs,cjs}": [
    "eslint --fix --config apps/api/eslint.config.js",
    "prettier --write",
  ],
  "apps/web/**/*.{ts,tsx,js,jsx,mjs,cjs}": [
    "eslint --fix --config apps/web/eslint.config.js",
    "prettier --write",
  ],
  "packages/constants/**/*.{ts,tsx,js,jsx,mjs,cjs}": [
    "eslint --fix --config packages/constants/eslint.config.js",
    "prettier --write",
  ],
  "packages/types/**/*.{ts,tsx,js,jsx,mjs,cjs}": [
    "eslint --fix --config packages/types/eslint.config.js",
    "prettier --write",
  ],
  "packages/ui/**/*.{ts,tsx,js,jsx,mjs,cjs}": [
    "eslint --fix --config packages/ui/eslint.config.js",
    "prettier --write",
  ],
  "packages/utils/**/*.{ts,tsx,js,jsx,mjs,cjs}": [
    "eslint --fix --config packages/utils/eslint.config.js",
    "prettier --write",
  ],
  "packages/validation/**/*.{ts,tsx,js,jsx,mjs,cjs}": [
    "eslint --fix --config packages/validation/eslint.config.js",
    "prettier --write",
  ],
};

export default {
  ...workspaceEslintConfigs,

  // Repo-level tooling files only — anchored with a leading `./` so this
  // matches just the top-level file, not same-named files inside the
  // workspaces above. (A slash-free pattern like "eslint.config.js" runs
  // with lint-staged's `matchBase` and would match *every* directory's
  // eslint.config.js by basename alone.)
  "./{eslint.config.js,prettier.config.js,commitlint.config.js,.lintstagedrc.js}": [
    "eslint --fix",
    "prettier --write",
  ],

  "*.{json,jsonc,md,yml,yaml,css}": ["prettier --write"],

  // Prettier has no parser for `.prisma` files and no plugin is
  // installed to add one. Prisma ships its own canonical formatter for
  // schema files, so use that instead. `prisma format` always formats
  // the whole schema, so the matched filenames are intentionally not
  // forwarded as arguments (a function that ignores its `filenames`
  // argument is how lint-staged avoids appending them) — there is
  // exactly one schema file, and Prisma's CLI has no notion of
  // formatting part of it. Runs through `pnpm --filter` so the
  // package-local `prisma` binary resolves correctly even though the
  // hook itself runs from the repo root.
  "*.prisma": () => "pnpm --filter @stackleo/api run prisma:format",
};
