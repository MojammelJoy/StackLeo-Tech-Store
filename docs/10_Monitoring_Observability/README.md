# 10_Monitoring_Observability

Concrete, actionable monitoring and logging documentation for StackLeo Tech Store — the hands-on companion to [`docs/07_DevOps`](../07_DevOps)'s vendor-neutral `monitoring-strategy.md`, `logging-governance.md`, and `observability-strategy.md`. Where those documents define principle and governance, the two here describe _this repository's actual_ logging and monitoring configuration and what's genuinely wired in versus prepared for later.

## Contents

| Document                                                       | Purpose                                                                                                           |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [`logging-configuration.md`](./logging-configuration.md)       | How this app logs today, and how container-level log rotation is configured.                                      |
| [`monitoring-configuration.md`](./monitoring-configuration.md) | What health signals exist today, and the reference Prometheus config prepared for future metrics instrumentation. |

## Scope

Neither document adds new application logic. `apps/api` already logs via `pino`; neither document changes that. Neither adds a `/metrics` endpoint to any app — doing so is application code, out of scope for this deployment foundation. Both describe the _infrastructure_ around what exists (container log rotation, health-check wiring, a ready-to-use scrape config) and the _future_ wiring documented but not implemented.
