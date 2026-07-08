import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { PlanRequestSchema, PlanResponseSchema, type PlanResponse } from "../schemas/plan.schema";
import { generatePlan } from "../services/groq.service";
import { redis } from "../config/redis";
import { Plan } from "../models/Plan.model";
import { normalizeQuery } from "../utils/normalizeQuery";

const TTL = 60 * 60 * 24;

export async function planController(req: Request, res: Response, next: NextFunction) {
  const parsed = PlanRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { hobby, level, weeklyTime } = parsed.data;
  const key = normalizeQuery(hobby, level, weeklyTime);

  try {
    const cached = await redis.get<PlanResponse>(key);
    if (cached) {
      console.log(`[redis-hit] ${key}`);
      res.json(cached);
      return;
    }

    const mongoDoc = await Plan.findOne({ normalizedQuery: key }).lean();
    if (mongoDoc) {
      console.log(`[mongo-hit] ${key}`);
      const plan = PlanResponseSchema.parse({ techniques: mongoDoc.techniques });
      await redis.set(key, plan, { ex: TTL });
      res.json(plan);
      return;
    }

    console.log(`[groq-miss] ${key}`);
    const plan = await generatePlan(parsed.data);
    await Plan.create({ hobby, level, weeklyTime, normalizedQuery: key, techniques: plan.techniques });
    await redis.set(key, plan, { ex: TTL });
    res.json(plan);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(500).json({ error: "AI returned invalid data", details: err.flatten() });
      return;
    }
    next(err);
  }
}
