import { z } from "zod";
import { ChapterMetaSchema } from "./chapter-meta.schema";

export const GeneratedPlanSchema = z.object({
  hobby: z.string().min(1),
  currentLevel: z.enum(["beginner", "intermediate"]),
  targetLevel: z.enum(["intermediate", "advanced"]),
  weeklyTimeHours: z.number().positive(),
  estimatedDurationWeeks: z.number().int().positive(),
  overview: z.string().min(1),
  goal: z.string().min(1),
  chapters: z.array(ChapterMetaSchema).min(5).max(10),
});

// The full persisted / API-facing plan, once it has a Mongo _id.
export const PlanSchema = GeneratedPlanSchema.extend({
  id: z.string().min(1),
});

export type GeneratedPlan = z.infer<typeof GeneratedPlanSchema>;
export type Plan = z.infer<typeof PlanSchema>;
