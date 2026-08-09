import next from "../../packages/config/eslint/next.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...next,
  {
    files: ["**/postcss.config.js", "**/postcss.config.cjs"],
    languageOptions: {
      globals: {
        module: "writable",
        require: "readonly",
      },
    },
  },
];
