// StackLeo — shared Next.js ESLint flat config.
// Extends react.js with Next.js core-web-vitals rules. Consumed by
// apps/web and apps/admin.

import nextPlugin from "@next/eslint-plugin-next";

import react from "./react.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...react,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
];
