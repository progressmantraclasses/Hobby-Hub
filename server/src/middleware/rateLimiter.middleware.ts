import type { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis";

const WINDOW_MS = 60000; // 1 minute
const LIMIT = 10; // Max 10 requests per window

export async function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "anonymous";
  const key = `ratelimit:${ip}`;
  const now = Date.now();

  try {
    await redis.zremrangebyscore(key, 0, now - WINDOW_MS);
    const count = await redis.zcard(key);

    if (count >= LIMIT) {
      res.status(429).json({
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
      });
      return;
    }

    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    await redis.expire(key, Math.ceil(WINDOW_MS / 1000));
    next();
  } catch (err) {
    next(err); // Fallback to global error handler if Redis fails
  }
}
