// StackLeo Tech Store — Commitlint configuration.
// Enforces Conventional Commits (https://www.conventionalcommits.org/).

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "subject-case": [2, "never", ["upper-case", "start-case", "pascal-case"]],
    "subject-empty": [2, "never"],
    "header-max-length": [2, "always", 100],
  },
};
