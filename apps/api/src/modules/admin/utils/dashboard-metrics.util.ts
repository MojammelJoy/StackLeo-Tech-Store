/** Percentage change from `previous` to `current` — pure arithmetic a
 * dashboard widget would use to render a "+12%" style indicator. `0`
 * when there's nothing to compare against, rather than `Infinity`/`NaN`. */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return 0;
  }
  return ((current - previous) / previous) * 100;
}
