import type { Request, Response } from "express";

import { getHealth, getLiveness, getReadiness } from "./health.service";

export function healthHandler(_req: Request, res: Response): void {
  res.status(200).json(getHealth());
}

export async function readinessHandler(_req: Request, res: Response): Promise<void> {
  const readiness = await getReadiness();
  res.status(readiness.status === "ok" ? 200 : 503).json(readiness);
}

export function livenessHandler(_req: Request, res: Response): void {
  res.status(200).json(getLiveness());
}
