# Logging Configuration

How this application logs today, and how container-level log handling is configured around it. No application logging code changed to write this document — see "Scope" in this folder's `README.md`.

## Application-level logging (already in place)

`apps/api/src/logger/logger.ts` configures a single `pino` logger, `service: "stackleo-api"`-tagged, at the level set by `LOG_LEVEL` (`config.logger.level`, from `apps/api/.env*`):

- **Development** — pretty-printed via `pino-pretty` (colorized, human-readable).
- **Production** (`config.isProduction`) — plain structured JSON, one line per event — the shape a log-aggregation pipeline (see "Future centralized logging" below) actually wants.

`apps/web`/`apps/admin` (Next.js) use Next's own default console output; neither has a custom logger.

## Container-level log handling (this foundation's actual contribution)

Every service in `docker-compose.yml` sets an explicit `logging:` driver:

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

Without this, Docker's default `json-file` driver keeps logs **unbounded** — a long-running container can fill the host's disk over time. This caps each container at 3 rotated files of 10MB (20MB in `docker-compose.production.yml`, given production traffic volume), discarding the oldest once the cap is reached. Logs are still readable the normal way: `docker compose logs -f api`.

## What this doesn't do

- **No log shipping** — logs stay on the host running each container; nothing forwards them to a central store. `docker compose logs` (or `docker logs <container>`) is the only way to read them today.
- **No structured log parsing pipeline** — `pino`'s JSON output in production is _shaped_ for one (each line is a self-contained JSON object with `level`/`time`/`service`/`msg`), but nothing here parses or indexes it.

## Future centralized logging

When log volume or the number of running instances makes reading `docker compose logs` impractical, the natural next step is a log-shipping sidecar or driver pointed at a real aggregation backend (Loki, an ELK stack, a hosted provider) — Docker's `logging.driver` key is exactly where that would be configured (e.g. switching `driver: json-file` to `driver: loki` with a Loki endpoint), without any change to how `apps/api` itself logs. Not configured here — no specific backend is chosen or assumed.
