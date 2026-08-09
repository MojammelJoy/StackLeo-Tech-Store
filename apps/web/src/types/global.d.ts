// `tsc --noEmit` (this app's `typecheck` script) doesn't get Next's
// build-time asset-import handling — CSS Modules are already covered by
// `next/types/global.d.ts`, but a plain side-effect CSS import (as used in
// `app/layout.tsx`) needs this ambient declaration to type-check standalone.
declare module "*.css";
