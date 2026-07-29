# scripts/

Repository automation and tooling scripts for StackLeo Tech Store.

## Purpose

Holds cross-cutting automation that operates at the repository level — setup scripts, release tooling, workspace maintenance, and CI helper scripts — rather than logic belonging to any single app or package.

## Conventions

- A script here must be genuinely repository-wide; logic specific to one app belongs in that app's own `package.json` scripts instead.
- Every script should be self-documenting: a one-line comment at the top explaining what it does and when it is invoked (locally, in CI, or both).
- No implementation is included in this scaffold — this folder is a placeholder for automation to be added as the repository matures.
