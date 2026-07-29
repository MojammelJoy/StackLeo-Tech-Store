// StackLeo — shared Node.js ESLint flat config.
// Extends base.js with Node-specific rules. Consumed by apps/api.

import nodePlugin from "eslint-plugin-n";
import globals from "globals";

import base from "./base.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...base,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "n/no-process-exit": "warn",
      "n/no-deprecated-api": "error",
      "n/no-unsupported-features/es-syntax": "off", // TypeScript compiles the syntax
      "n/no-missing-import": "off", // handled by TypeScript module resolution
    },
  },
];
