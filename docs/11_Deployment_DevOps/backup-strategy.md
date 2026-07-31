# Backup Strategy

What gets backed up, how often, and how to run a backup or restore with this repository's tooling. The conceptual, vendor-neutral counterpart is `docs/07_DevOps/disaster-recovery.md`; this document is the concrete, hands-on execution of it for this stack specifically.

## What gets backed up

The only stateful data this stack owns is **Postgres** (`stackleo-postgres-data` volume). Redis (`stackleo-redis-data`) holds cache/session data that is safe to lose and rebuild — it is not backed up.

## How

```bash
DATABASE_URL=postgresql://stackleo:stackleo@localhost:5432/stackleo_production \
  bash scripts/backup-db.sh ./backups
```

Produces a timestamped, gzip-compressed `pg_dump` at `./backups/stackleo-<UTC timestamp>.sql.gz`. Run this against the real `DATABASE_URL` for whichever environment you're backing up — never assume the default in `scripts/backup-db.sh`'s own examples.

## Retention

- Keep at least the **last 7 daily backups** and the **last 4 weekly backups** at all times.
- Store backups somewhere independent of the database host itself — a backup that lives on the same disk as the database it protects does not protect against disk failure.
- Verify a backup is restorable on a schedule (quarterly at minimum) rather than assuming it works because the dump command exited successfully — see `rollback-strategy.md`'s restore steps.

## Schedule

Run `scripts/backup-db.sh` on a recurring schedule (cron, a scheduled CI job, or your hosting platform's own scheduler) — this repository does not include a scheduler itself; wiring one in is an infrastructure choice for whoever operates a real deployment, deliberately left open rather than assumed (see the root task's "no infrastructure-as-code" constraint).

## Restoring

See [`rollback-strategy.md`](./rollback-strategy.md)'s "Database rollback" section — restoring a backup is one form of rollback, and the two documents intentionally share one procedure rather than describing it twice.
