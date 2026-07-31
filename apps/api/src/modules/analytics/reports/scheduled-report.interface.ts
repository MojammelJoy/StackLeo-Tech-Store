/**
 * What a future "scheduled reports" feature would persist — a recurring
 * report request plus who receives it. No scheduler, cron runner, or
 * delivery mechanism exists in this foundation; this only documents the
 * shape such a feature would eventually store.
 */
export interface ScheduledReport {
  id: string;
  reportType: string;
  cronExpression: string;
  recipients: string[];
  nextRunAt: Date;
}
