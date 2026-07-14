import { z } from "zod";

export const PlanRequestSchema = z.object({
  hobby: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  weeklyTime: z.number().positive(),
});

export type PlanRequest = z.infer<typeof PlanRequestSchema>;
