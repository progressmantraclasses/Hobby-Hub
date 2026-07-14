import { z } from "zod";

const InteractiveDataSchema = z.discriminatedUnion("activityType", [
  z.object({ activityType: z.literal("flashcard"), cards: z.array(z.object({ front: z.string(), back: z.string() })) }),
  z.object({ activityType: z.literal("match"), pairs: z.array(z.object({ term: z.string(), match: z.string() })) }),
  z.object({ activityType: z.literal("drag_drop"), items: z.array(z.string()), correctOrder: z.array(z.string()) }),
  z.object({ activityType: z.literal("identify"), items: z.array(z.object({ label: z.string(), correct: z.boolean() })) }),
  z.object({ activityType: z.literal("scenario"), situation: z.string(), choices: z.array(z.string()), bestChoice: z.string() }),
]);

export const SummaryStepSchema = z.object({ type: z.literal("summary"), whatYouWillLearn: z.array(z.string()), keyConcepts: z.array(z.string()), expectedOutcome: z.string() });
export const VideoStepSchema = z.object({ type: z.literal("video"), searchQueries: z.array(z.string()).min(1).max(2), video: z.any().optional(), videoSummary: z.string().optional() });
export const ReflectionStepSchema = z.object({ type: z.literal("reflection"), question: z.string(), format: z.enum(["mcq", "shortAnswer", "trueFalse"]), options: z.array(z.string()).optional(), correctAnswer: z.string().optional() });
export const ReadingStepSchema = z.object({ type: z.literal("reading"), content: z.string(), tips: z.array(z.string()), commonMistakes: z.array(z.string()), imagePrompts: z.array(z.string()) });
export const InteractiveStepSchema = z.object({ type: z.literal("interactive").catch("interactive") }).and(InteractiveDataSchema);
export const QuizStepSchema = z.object({ type: z.literal("quiz"), passingScore: z.literal(70), questions: z.array(z.object({ question: z.string(), type: z.enum(["mcq", "trueFalse", "fillBlank", "shortAnswer"]), options: z.array(z.string()).optional(), correctAnswer: z.string().optional() })).max(10) });
export const PracticeStepSchema = z.object({ type: z.literal("practice"), task: z.string(), expectedOutcome: z.string(), suggestedMinutes: z.number().int().positive() });

export const ChapterContentSchema = z.object({
  steps: z.tuple([SummaryStepSchema, VideoStepSchema, ReflectionStepSchema, ReadingStepSchema, InteractiveStepSchema, QuizStepSchema, PracticeStepSchema]),
});

export type ChapterContent = z.infer<typeof ChapterContentSchema>;
export type LearningStep = ChapterContent["steps"][number];
export type VideoStep = z.infer<typeof VideoStepSchema>;
