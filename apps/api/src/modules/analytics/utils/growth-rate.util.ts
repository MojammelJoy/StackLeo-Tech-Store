/**
 * Percentage change from `previous` to `current` — pure arithmetic a
 * KPI or metric widget would use to render a "+12%" style indicator.
 * `0` when there's nothing to compare against, rather than
 * `Infinity`/`NaN`. Deliberately its own copy, independent of
 * `modules/admin`'s identical helper — this module never imports
 * `modules/admin`, the same cross-module decoupling every foundation in
 * this app follows.
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return 0;
  }
  return ((current - previous) / previous) * 100;
}
