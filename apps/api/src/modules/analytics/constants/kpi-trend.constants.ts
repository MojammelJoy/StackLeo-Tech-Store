/** The direction a KPI moved relative to its previous period — see
 * `types/kpi.types.ts` and `utils/kpi-trend.util.ts`'s `determineTrend`. */
export const KPI_TRENDS = {
  UP: "up",
  DOWN: "down",
  FLAT: "flat",
} as const;

export type KpiTrend = (typeof KPI_TRENDS)[keyof typeof KPI_TRENDS];
