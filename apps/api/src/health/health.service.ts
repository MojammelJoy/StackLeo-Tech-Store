import { checkDatabaseConnection, checkRedisConnection } from "../lib";

import type { HealthResponse, LivenessResponse, ReadinessResponse } from "./health.types";

/**
 * Basic process-level health — confirms the process is running and able
 * to respond. Deliberately does not check external dependencies; that is
 * the readiness check's responsibility.
 */
export function getHealth(): HealthResponse {
  return {
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Readiness — confirms the process AND its external dependencies
 * (database, cache) are reachable, i.e. the instance is ready to accept
 * production traffic.
 */
export async function getReadiness(): Promise<ReadinessResponse> {
  const [databaseUp, redisUp] = await Promise.all([
    checkDatabaseConnection(),
    checkRedisConnection(),
  ]);

  const allUp = databaseUp && redisUp;

  return {
    status: allUp ? "ok" : "error",
    dependencies: {
      database: { status: databaseUp ? "ok" : "error" },
      redis: { status: redisUp ? "ok" : "error" },
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Liveness — confirms the process itself has not deadlocked or crashed.
 * Deliberately the cheapest possible check: orchestrators (Docker,
 * Render, Kubernetes) restart the instance if this ever fails to respond.
 */
export function getLiveness(): LivenessResponse {
  return { status: "ok" };
}
