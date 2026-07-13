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

// What the AI is expected to produce — no `id` yet, since the plan doesn't exist in Mongo until after generation.
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

// The full persisted/API-facing plan, once it has a Mongo _id.
export const PlanSchema = GeneratedPlanSchema.extend({
  id: z.string().min(1),
});

// ── Learning Steps ──────────────────────────────────────────────────────────

const InteractiveDataSchema = z.discriminatedUnion("activityType", [
  z.object({ activityType: z.literal("flashcard"), cards: z.array(z.object({ front: z.string(), back: z.string() })) }),
  z.object({ activityType: z.literal("match"),     pairs: z.array(z.object({ term: z.string(), match: z.string() })) }),
  z.object({ activityType: z.literal("drag_drop"), items: z.array(z.string()), correctOrder: z.array(z.string()) }),
  z.object({ activityType: z.literal("identify"),  items: z.array(z.object({ label: z.string(), correct: z.boolean() })) }),
  z.object({ activityType: z.literal("scenario"),  situation: z.string(), choices: z.array(z.string()), bestChoice: z.string() }),
]);

export const SummaryStepSchema     = z.object({ type: z.literal("summary"),     whatYouWillLearn: z.array(z.string()), keyConcepts: z.array(z.string()), expectedOutcome: z.string() });
export const VideoStepSchema       = z.object({ type: z.literal("video"),       searchQueries: z.array(z.string()).min(1).max(2), video: z.any().optional(), videoSummary: z.string().optional() });
export const ReflectionStepSchema  = z.object({ type: z.literal("reflection"),  question: z.string(), format: z.enum(["mcq", "shortAnswer", "trueFalse"]), options: z.array(z.string()).optional(), correctAnswer: z.string().optional() });
export const ReadingStepSchema     = z.object({ type: z.literal("reading"),     content: z.string(), tips: z.array(z.string()), commonMistakes: z.array(z.string()), imagePrompts: z.array(z.string()) });
export const InteractiveStepSchema = z.object({ type: z.literal("interactive").catch("interactive") }).and(InteractiveDataSchema);
export const QuizStepSchema        = z.object({ type: z.literal("quiz"),        passingScore: z.literal(70), questions: z.array(z.object({ question: z.string(), type: z.enum(["mcq", "trueFalse", "fillBlank", "shortAnswer"]), options: z.array(z.string()).optional(), correctAnswer: z.string().optional() })).max(10) });
export const PracticeStepSchema    = z.object({ type: z.literal("practice"),    task: z.string(), expectedOutcome: z.string(), suggestedMinutes: z.number().int().positive() });

export const ChapterContentSchema = z.object({
  steps: z.tuple([SummaryStepSchema, VideoStepSchema, ReflectionStepSchema, ReadingStepSchema, InteractiveStepSchema, QuizStepSchema, PracticeStepSchema]),
});

export type PlanRequest     = z.infer<typeof PlanRequestSchema>;
export type ChapterMeta     = z.infer<typeof ChapterMetaSchema>;
export type GeneratedPlan   = z.infer<typeof GeneratedPlanSchema>;
export type Plan            = z.infer<typeof PlanSchema>;
export type ChapterContent  = z.infer<typeof ChapterContentSchema>;
export type LearningStep    = ChapterContent["steps"][number];
