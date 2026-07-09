import { z } from "zod";

export const PlanRequestSchema = z.object({
  hobby: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  weeklyTime: z.number().positive(),
});

export const ChapterMetaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().positive(),
  summary: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  completed: z.boolean().default(false),
  contentGenerated: z.boolean().default(false),
});

export const PlanSchema = z.object({
  hobby: z.string().min(1),
  currentLevel: z.enum(["beginner", "intermediate"]),
  targetLevel: z.enum(["intermediate", "advanced"]),
  weeklyTimeHours: z.number().positive(),
  estimatedDurationWeeks: z.number().int().positive(),
  overview: z.string().min(1),
  goal: z.string().min(1),
  chapters: z.array(ChapterMetaSchema).min(5).max(10),
});

export type PlanRequest = z.infer<typeof PlanRequestSchema>;
export type ChapterMeta = z.infer<typeof ChapterMetaSchema>;
export type Plan = z.infer<typeof PlanSchema>;
