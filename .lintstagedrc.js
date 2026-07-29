// StackLeo Tech Store — lint-staged configuration.
// Runs only the checks relevant to each staged file's type, scoped to the
// files actually staged rather than the whole repository.

/** @type {import('lint-staged').Config} */
export default {
  "*.{ts,tsx,js,jsx,mjs,cjs}": ["eslint --fix", "prettier --write"],
  "*.{json,jsonc,md,yml,yaml,css}": ["prettier --write"],
  "*.prisma": ["prettier --write"],
};
