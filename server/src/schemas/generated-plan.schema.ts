import { z } from "zod";
import { ChapterMetaSchema } from "./chapter-meta.schema";

export const GeneratedPlanSchema = z.object({
  // hobby/currentLevel/targetLevel/weeklyTimeHours are values the model is only asked to echo
  // back — we already know them from the request itself, so parsing tolerates any drift here;
  // groq.service.ts overwrites all four with our own trusted values after a successful parse.
  hobby: z.string().catch(""),
  currentLevel: z.enum(["beginner", "intermediate"]).catch("beginner"),
  targetLevel: z.enum(["intermediate", "advanced"]).catch("intermediate"),
  weeklyTimeHours: z.coerce.number().positive().catch(1),
  estimatedDurationWeeks: z.coerce.number().int().positive(),
  overview: z.string().min(1),
  goal: z.string().min(1),
  chapters: z.array(ChapterMetaSchema).min(5),
});

// The full persisted / API-facing plan, once it has a Mongo _id.
export const PlanSchema = GeneratedPlanSchema.extend({
  id: z.string().min(1),
});

export type GeneratedPlan = z.infer<typeof GeneratedPlanSchema>;
export type Plan = z.infer<typeof PlanSchema>;
