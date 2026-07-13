import Groq from "groq-sdk";
import { z } from "zod";
import { env } from "../config/env";
import { AIProviderError } from "../utils/errors";
import { PlanRequestSchema, GeneratedPlanSchema, ChapterContentSchema, type GeneratedPlan, type ChapterContent } from "../schemas/plan.schema";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const PLAN_PROMPT = `You are a structured learning plan generator.
Return ONLY valid JSON — no markdown, no extra text.
Shape: { hobby, currentLevel, targetLevel, weeklyTimeHours, estimatedDurationWeeks, overview (2-3 sentences), goal (1 line), chapters: [{ id (slug), title, order, summary (2-3 sentences), estimatedMinutes, completed: false, contentGenerated: false }] }
Rules: 5-10 chapters, order starts at 1, do NOT generate step-level content here.`;

const CHAPTER_PROMPT = `You are a structured learning step generator.
Return ONLY valid JSON — no markdown, no extra text.
Generate exactly 7 learning steps in this fixed order:
1. summary: { type:"summary", whatYouWillLearn:string[], keyConcepts:string[], expectedOutcome:string }
2. video: { type:"video", searchQueries:string[] (1-2 entries, search intent only — no URLs) }
3. reflection: { type:"reflection", question:string, format:"mcq" (preferred) | "trueFalse", options:string[] (required if mcq or trueFalse), correctAnswer:string }
4. reading: { type:"reading", content:string (500-800 words), tips:string[], commonMistakes:string[], imagePrompts:string[] }
   * Rules for reading: 'content' must be pure explanatory prose. Do NOT write, list, or refer to tips, common mistakes, or image prompts inside the 'content' text, as they are shown separately.
5. interactive: { type:"interactive", activityType:"flashcard"|"match"|"drag_drop"|"identify"|"scenario", ...data }. The data MUST be flat alongside type and activityType (DO NOT nest inside another object). Shape varies: flashcard->{ cards:[{front,back}] }, match->{ pairs:[{term,match}] }, drag_drop->{ items:[],correctOrder:[] }, identify->{ items:[{label,correct}] }, scenario->{ situation,choices:[],bestChoice }.
6. quiz: { type:"quiz", passingScore:70, questions:[5-10 {question,type:"mcq"|"trueFalse"|"fillBlank"|"shortAnswer",options?:string[],correctAnswer}] }
7. practice: { type:"practice", task:string, expectedOutcome:string, suggestedMinutes:number }
Return: { steps: [summary, video, reflection, reading, interactive, quiz, practice] }`;

async function callGroq(system: string, user: string) {
  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_completion_tokens: 4096,
  });
  return JSON.parse(res.choices[0]?.message?.content ?? "{}");
}

// Shared by generatePlan/generateChapterContent: both call Groq with a prompt, validate the
// JSON it returns against a Zod schema, and retry a few times if the model returns something
// that doesn't parse. On the final attempt, a Groq API failure (outage, rate limit, bad key)
// is raised as an AIProviderError so the client gets a 503, not a generic 500 — anything else
// (malformed JSON that fails our schema) keeps the original, caller-specific message.
async function generateWithRetries<T>(
  label: string,
  attempt: () => Promise<T>,
  finalErrorMessage: string
): Promise<T> {
  const MAX_RETRIES = 3;

  for (let attemptNum = 1; attemptNum <= MAX_RETRIES; attemptNum++) {
    try {
      return await attempt();
    } catch (error) {
      console.warn(`\n⚠️ [${label}] AI returned invalid data. Retrying... (Attempt ${attemptNum} of ${MAX_RETRIES})`);

      if (attemptNum === MAX_RETRIES) {
        if (error instanceof z.ZodError) {
          console.error("Zod Validation Errors on final attempt:", JSON.stringify(error.flatten(), null, 2));
          throw new Error(finalErrorMessage, { cause: error });
        }
        if (error instanceof Groq.APIError) {
          console.error(`Groq API Error on final attempt (${error.status}):`, error.message);
          throw new AIProviderError(finalErrorMessage, { cause: error });
        }
        throw new Error(finalErrorMessage, { cause: error });
      }
    }
  }

  // Unreachable — the loop above always returns or throws on its final iteration.
  throw new Error(finalErrorMessage);
}

export async function generatePlan(input: unknown): Promise<GeneratedPlan> {
  const { hobby, level, weeklyTime } = PlanRequestSchema.parse(input);
  const currentLevel = level === "advanced" ? "intermediate" : level as "beginner" | "intermediate";
  const targetLevel  = currentLevel === "beginner" ? "intermediate" : "advanced";

  return generateWithRetries(
    "Plan Generation",
    async () => {
      const raw = await callGroq(PLAN_PROMPT, `Hobby: ${hobby}\nCurrent level: ${currentLevel}\nTarget level: ${targetLevel}\nWeekly time: ${weeklyTime}h`);
      return GeneratedPlanSchema.parse(raw);
    },
    "Failed to generate a valid plan after multiple attempts. Please try again."
  );
}

export async function generateChapterContent(hobby: string, level: string, title: string, summary: string): Promise<ChapterContent> {
  return generateWithRetries(
    "Chapter Generation",
    async () => {
      const raw = await callGroq(CHAPTER_PROMPT, `Hobby: ${hobby}\nLevel: ${level}\nChapter title: ${title}\nChapter summary: ${summary}`);
      return ChapterContentSchema.parse(raw);
    },
    "Failed to generate valid chapter content after multiple attempts."
  );
}
