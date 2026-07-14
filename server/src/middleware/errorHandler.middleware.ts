import type { Request, Response, NextFunction } from "express";
import { AIProviderError } from "../utils/errors";
import { logger } from "../utils/logger";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(err);

  if (err instanceof AIProviderError) {
    res.status(503).json({
      code: "AI_SERVICE_UNAVAILABLE",
      message: err.message,
    });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}

