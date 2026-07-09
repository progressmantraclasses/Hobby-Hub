import Groq from "groq-sdk";
import { z } from "zod";
import { env } from "../config/env";
import { PlanRequestSchema, PlanSchema, ChapterContentSchema, type Plan, type ChapterContent } from "../schemas/plan.schema";

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
3. reflection: { type:"reflection", question:string, format:"mcq"|"shortAnswer"|"trueFalse", options?:string[], correctAnswer:string }
4. reading: { type:"reading", content:string (500-800 words), tips:string[], commonMistakes:string[], imagePrompts:string[] }
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
  });
  return JSON.parse(res.choices[0]?.message?.content ?? "{}");
}

export async function generatePlan(input: unknown): Promise<Plan> {
  const { hobby, level, weeklyTime } = PlanRequestSchema.parse(input);
  const currentLevel = level === "advanced" ? "intermediate" : level as "beginner" | "intermediate";
  const targetLevel  = currentLevel === "beginner" ? "intermediate" : "advanced";
  const raw = await callGroq(PLAN_PROMPT, `Hobby: ${hobby}\nCurrent level: ${currentLevel}\nTarget level: ${targetLevel}\nWeekly time: ${weeklyTime}h`);
  return PlanSchema.parse(raw);
}

export async function generateChapterContent(hobby: string, level: string, title: string, summary: string): Promise<ChapterContent> {
  const raw = await callGroq(CHAPTER_PROMPT, `Hobby: ${hobby}\nLevel: ${level}\nChapter title: ${title}\nChapter summary: ${summary}`);
  try {
    return ChapterContentSchema.parse(raw);
  } catch (error) {
    console.error("Failed to parse ChapterContent. Raw output:", JSON.stringify(raw, null, 2));
    if (error instanceof z.ZodError) {
      console.error("Zod Validation Errors:", JSON.stringify(error.flatten(), null, 2));
    }
    throw error;
  }
}
