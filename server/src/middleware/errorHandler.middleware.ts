import type { Request, Response, NextFunction } from "express";
import { AIProviderError } from "../utils/errors";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err instanceof AIProviderError) {
    res.status(503).json({
      code: "AI_SERVICE_UNAVAILABLE",
      message: err.message,
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
}
