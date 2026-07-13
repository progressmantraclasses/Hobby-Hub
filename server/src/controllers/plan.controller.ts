import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { PlanRequestSchema, PlanSchema, type Plan } from "../schemas/plan.schema";
import { generatePlan } from "../services/groq.service";
import { generateEmbedding, findSimilarPlan } from "../services/semanticCache.service";
import { redis } from "../config/redis";
import { Plan as PlanModel } from "../models/Plan.model";
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
    const cached = await redis.get<Plan>(key);
    if (cached) {
      console.log(`[redis-hit] ${key}`);
      res.json(cached);
      return;
    }

    const mongoDoc = await PlanModel.findOne({ normalizedQuery: key }).lean();
    if (mongoDoc) {
      console.log(`[mongo-hit] ${key}`);
      const plan = PlanSchema.parse({ ...mongoDoc, id: mongoDoc._id.toString() });
      await redis.set(key, plan, { ex: TTL });
      res.json(plan);
      return;
    }

    const queryEmbedding = await generateEmbedding(hobby.trim().toLowerCase());

    const similarDoc = await findSimilarPlan(queryEmbedding, level, weeklyTime);
    if (similarDoc) {
      console.log(`[semantic-hit] ${key}`);
      const plan = PlanSchema.parse({ ...similarDoc, id: similarDoc._id.toString() });
      await redis.set(key, plan, { ex: TTL });
      res.json(plan);
      return;
    }

    console.log(`[groq-miss] ${key}`);
    const generated = await generatePlan(parsed.data);
    const created = await PlanModel.create({ ...generated, normalizedQuery: key, embedding: queryEmbedding });
    const plan = PlanSchema.parse({ ...generated, id: created._id.toString() });
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
