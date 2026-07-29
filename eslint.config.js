// Root ESLint flat config — lints repository-level tooling files only
// (eslint.config.js, prettier.config.js, commitlint.config.js, .lintstagedrc.js).
// Each app/package lints its own source via its own eslint.config.js, which
// composes the shared layers in packages/config/eslint/.

import base from "./packages/config/eslint/base.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...base,
  {
    ignores: [
      "apps/**",
      "packages/**",
      "docs/**",
      "docker/**",
      "scripts/**",
      "**/node_modules/**",
    ],
  },
];
