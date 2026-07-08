import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { generatePlan } from "../services/groq.service";
import { PlanRequestSchema } from "../schemas/plan.schema";

export async function planController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = PlanRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  try {
    const plan = await generatePlan(parsed.data);
    res.json(plan);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(500).json({ error: "AI returned invalid data", details: err.flatten() });
      return;
    }
    next(err);
  }
}
