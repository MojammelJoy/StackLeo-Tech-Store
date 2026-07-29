// StackLeo — shared React ESLint flat config.
// Extends base.js with React and React Hooks rules. Consumed directly by
// packages/ui, and indirectly by apps/web and apps/admin via next.js.

import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

import base from "./base.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...base,
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules, // React 18+: no `import React` needed for JSX
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off", // TypeScript handles prop validation
    },
  },
];
