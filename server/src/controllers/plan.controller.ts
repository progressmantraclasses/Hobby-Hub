import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { PlanRequestSchema, PlanSchema, type Plan, type PlanRequest } from "../schemas/plan.schema";
import { generatePlan } from "../services/groq.service";
import { generateEmbedding, findSimilarPlan } from "../services/semanticCache.service";
import { redis } from "../config/redis";
import { Plan as PlanModel } from "../models/Plan.model";
import { normalizeQuery } from "../utils/normalizeQuery";
import { logger } from "../utils/logger";
import { REDIS_CACHE_TTL } from "../config/constants";

const inFlightGenerations = new Map<string, Promise<Plan>>();

async function resolveAndCachePlan(key: string, requestData: PlanRequest): Promise<Plan> {
  const { hobby, level, weeklyTime } = requestData;
  const queryEmbedding = await generateEmbedding(hobby.trim().toLowerCase());

  const similarDoc = await findSimilarPlan(queryEmbedding, level, weeklyTime);
  if (similarDoc) {
    logger.info(`[semantic-hit] ${key}`);
    const plan = PlanSchema.parse({ ...similarDoc, id: similarDoc._id.toString() });
    await redis.set(key, plan, { ex: REDIS_CACHE_TTL });
    return plan;
  }

  logger.info(`[groq-miss] ${key}`);
  const generated = await generatePlan(requestData);
  const created = await PlanModel.create({ ...generated, normalizedQuery: key, embedding: queryEmbedding });
  const plan = PlanSchema.parse({ ...generated, id: created._id.toString() });
  await redis.set(key, plan, { ex: REDIS_CACHE_TTL });
  return plan;
}

export async function planController(req: Request, res: Response, next: NextFunction) {
  const parsed = PlanRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { hobby, level, weeklyTime } = parsed.data;
  const key = normalizeQuery(hobby, level, weeklyTime);

  try {
    const cached = await redis.get<Plan>(key);
    if (cached) {
      logger.info(`[redis-hit] ${key}`);
      res.json(cached);
      return;
    }

    const mongoDoc = await PlanModel.findOne({ normalizedQuery: key }).lean();
    if (mongoDoc) {
      logger.info(`[mongo-hit] ${key}`);
      const plan = PlanSchema.parse({ ...mongoDoc, id: mongoDoc._id.toString() });
      await redis.set(key, plan, { ex: REDIS_CACHE_TTL });
      res.json(plan);
      return;
    }

    let generation = inFlightGenerations.get(key);
    if (!generation) {
      generation = resolveAndCachePlan(key, parsed.data).finally(() => inFlightGenerations.delete(key));
      inFlightGenerations.set(key, generation);
    }

    res.json(await generation);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(500).json({ error: "AI returned invalid data", details: err.flatten() });
      return;
    }
    next(err);
  }
}
