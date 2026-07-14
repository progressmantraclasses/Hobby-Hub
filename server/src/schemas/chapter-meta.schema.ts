import { z } from "zod";

export const ChapterMetaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  order: z.coerce.number().int().positive(),
  summary: z.string().min(1),
  estimatedMinutes: z.coerce.number().int().positive().catch(30),
  completed: z.boolean().catch(false),
  contentGenerated: z.boolean().catch(false),
});

export type ChapterMeta = z.infer<typeof ChapterMetaSchema>;
