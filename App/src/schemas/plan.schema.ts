import { z } from "zod";

export const ResourceType = z.enum([
  "watch",
  "read",
  "interactive-drill",
  "practice-checklist",
]);

export const PlanRequestSchema = z.object({
  hobby: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  weeklyTime: z.number().positive(),
});

export const TechniqueSchema = z.object({
  title: z.string().min(1),
  why: z.string().min(1),
  resourceType: ResourceType,
  searchQuery: z.string().min(1),
  order: z.number().int().positive(),
});

export const PlanResponseSchema = z.object({
  techniques: z.array(TechniqueSchema).min(5).max(8),
});

export type PlanRequest = z.infer<typeof PlanRequestSchema>;
export type Technique = z.infer<typeof TechniqueSchema>;
export type PlanResponse = z.infer<typeof PlanResponseSchema>;
