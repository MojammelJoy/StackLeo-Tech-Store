export type HealthState = "ok" | "error";

export interface DependencyStatus {
  status: HealthState;
}

export interface HealthResponse {
  status: HealthState;
  uptimeSeconds: number;
  timestamp: string;
}

export interface ReadinessResponse {
  status: HealthState;
  dependencies: {
    database: DependencyStatus;
    redis: DependencyStatus;
  };
  timestamp: string;
}

export interface LivenessResponse {
  status: HealthState;
}
