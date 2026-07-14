import { z } from "zod";

export const ChapterMetaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().positive(),
  summary: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  completed: z.boolean().default(false),
  contentGenerated: z.boolean().default(false),
});

export type ChapterMeta = z.infer<typeof ChapterMetaSchema>;
